import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Edit2 } from 'lucide-react';
import ActionButtons from '../ui/ActionButtons';
import Card from '../ui/Card';

interface IntermediateResults {
  initialMetrics: string[];
  filteredByGoldenRules: string[];
  filteredByDimensions: string[];
  filteredByExactMatch: string[];
  disambiguationSteps: string[];
}

interface AnnotationData {
  originalValue: string[];
  annotatedValue: string[];
}

interface IntermediateAnnotations {
  initialMetrics?: AnnotationData;
  filteredByGoldenRules?: AnnotationData;
  filteredByDimensions?: AnnotationData;
  filteredByExactMatch?: AnnotationData;
  disambiguationSteps?: AnnotationData;
}

interface ParameterData {
  extractedInfo: string;
  disambiguationResult: string;
  isCorrect: boolean;
  userExtractedInfo: string;
  userDisambiguationResult: string;
  intermediateResults?: IntermediateResults;
  annotations?: IntermediateAnnotations;
}

interface QueryParameter {
  metric: ParameterData;
  timeRange: ParameterData;
  constraints: ParameterData;
  groupBy: ParameterData;
  sorting: ParameterData;
  calculation: ParameterData;
}

interface QueryExtractionData {
  query: string;
  parameters: QueryParameter;
}

interface ParameterExtractionStepProps {
  data: QueryExtractionData[];
  onUpdate: (data: QueryExtractionData[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

const ParameterExtractionStep = ({ data, onUpdate, onNext, onPrev }: ParameterExtractionStepProps) => {
  const [localData, setLocalData] = useState<QueryExtractionData[]>(data);
  const [currentQueryIndex, setCurrentQueryIndex] = useState(0);
  const [canProceed, setCanProceed] = useState(true);
  const [showIntermediateResults, setShowIntermediateResults] = useState(false);
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<{
    title: string;
    key: keyof IntermediateResults;
    value: string;
  } | null>(null);

  const currentQuery = localData[currentQueryIndex];
  const parameterLabels = {
    metric: '指标',
    timeRange: '时间范围',
    constraints: '约束条件',
    groupBy: '分组条件',
    sorting: '排序条件',
    calculation: '计算方式'
  };

  useEffect(() => {
    const allValid = Object.entries(currentQuery.parameters).every(
      ([_, param]) => param.isCorrect || (!param.isCorrect && param.userExtractedInfo.trim() !== '' && param.userDisambiguationResult.trim() !== '')
    );
    setCanProceed(allValid);
  }, [currentQuery]);

  const handleParameterChange = (key: keyof QueryParameter, isCorrect: boolean) => {
    const updatedData = [...localData];
    updatedData[currentQueryIndex].parameters[key].isCorrect = isCorrect;
    
    if (isCorrect) {
      updatedData[currentQueryIndex].parameters[key].userExtractedInfo = '';
      updatedData[currentQueryIndex].parameters[key].userDisambiguationResult = '';
    }
    
    setLocalData(updatedData);
  };

  const handleUserInputChange = (key: keyof QueryParameter, field: 'userExtractedInfo' | 'userDisambiguationResult', value: string) => {
    const updatedData = [...localData];
    updatedData[currentQueryIndex].parameters[key][field] = value;
    setLocalData(updatedData);
  };

  const handleNext = () => {
    if (currentQueryIndex < localData.length - 1) {
      setCurrentQueryIndex(currentQueryIndex + 1);
    } else {
      onUpdate(localData);
      onNext();
    }
  };

  const handlePrev = () => {
    if (currentQueryIndex > 0) {
      setCurrentQueryIndex(currentQueryIndex - 1);
    } else {
      onPrev();
    }
  };

  const handleAnnotationClick = (title: string, key: keyof IntermediateResults, value: string[]) => {
    setCurrentAnnotation({ 
      title, 
      key, 
      value: value.join(', ')
    });
    setShowAnnotationModal(true);
  };

  const handleAnnotationSave = (value: string) => {
    if (!currentAnnotation) return;

    const updatedData = [...localData];
    const currentMetric = updatedData[currentQueryIndex].parameters.metric;
    
    if (!currentMetric.annotations) {
      currentMetric.annotations = {};
    }

    currentMetric.annotations[currentAnnotation.key] = {
      originalValue: currentMetric.intermediateResults?.[currentAnnotation.key] || [],
      annotatedValue: value.split(',').map(item => item.trim())
    };

    setLocalData(updatedData);
    setShowAnnotationModal(false);
    setCurrentAnnotation(null);
  };

  const renderIntermediateResults = () => {
    const results = currentQuery.parameters.metric.intermediateResults;
    const annotations = currentQuery.parameters.metric.annotations;
    if (!results) return null;

    const sections = [
      { title: '黄金规则过滤指标列表', key: 'filteredByGoldenRules' as const },
      { title: '维度高置信组合过滤指标列表', key: 'filteredByDimensions' as const },
      { title: '召回指标列表', key: 'initialMetrics' as const },
      { title: '完全匹配指标列表', key: 'filteredByExactMatch' as const },
      { title: '策略消歧中间结果', key: 'disambiguationSteps' as const }
    ];

    return (
      <div className="mt-4 space-y-3 text-sm">
        <h4 className="font-medium text-gray-700">中间结果：</h4>
        <div className="space-y-2">
          {sections.map(({ title, key }) => {
            const annotation = annotations?.[key];
            return (
              <div key={key} className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-gray-600">{title}：</p>
                  <button
                    onClick={() => handleAnnotationClick(title, key, results[key])}
                    className="text-blue-600 hover:text-blue-700 p-1 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">原始结果：</p>
                    <p className="text-gray-800">{results[key].join(', ')}</p>
                  </div>
                  {annotation && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">标注结果：</p>
                      <p className="text-blue-800">{annotation.annotatedValue.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">槽位提取和消歧</h2>
          <p className="text-gray-600 mb-4">
            请评估系统对查询的槽位提取和消歧是否准确：
          </p>
          <div className="text-sm text-gray-500 mb-4">
            当前标注第 {currentQueryIndex + 1} 个查询，共 {localData.length} 个
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-gray-500 mb-1">拆解查询：</p>
          <p className="text-blue-800 font-medium">{currentQuery.query}</p>
        </div>

        <div className="space-y-4">
          {Object.entries(currentQuery.parameters).map(([key, param]) => (
            <div key={key} className="border border-gray-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-800">
                  {parameterLabels[key as keyof QueryParameter]}
                </h3>
                <div className="flex items-center space-x-4">
                  <div 
                    className={`flex items-center cursor-pointer ${param.isCorrect ? 'text-green-600' : 'text-gray-400'}`}
                    onClick={() => handleParameterChange(key as keyof QueryParameter, true)}
                  >
                    <div className={`w-4 h-4 border rounded-full mr-1 ${param.isCorrect ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                      {param.isCorrect && <div className="w-2 h-2 bg-white rounded-full mx-auto my-auto"></div>}
                    </div>
                    <span className="text-sm">正确</span>
                  </div>
                  <div 
                    className={`flex items-center cursor-pointer ${!param.isCorrect ? 'text-red-600' : 'text-gray-400'}`}
                    onClick={() => handleParameterChange(key as keyof QueryParameter, false)}
                  >
                    <div className={`w-4 h-4 border rounded-full mr-1 ${!param.isCorrect ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}>
                      {!param.isCorrect && <div className="w-2 h-2 bg-white rounded-full mx-auto my-auto"></div>}
                    </div>
                    <span className="text-sm">不正确</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className={`p-3 ${param.isCorrect ? 'bg-purple-50' : 'bg-purple-100'} rounded-md`}>
                  <p className="text-sm text-gray-600 mb-1">提取到的信息：</p>
                  <p className={param.isCorrect ? 'text-purple-800' : 'text-purple-900'}>
                    {param.extractedInfo}
                  </p>
                </div>
                
                {param.disambiguationResult && (
                  <div className={`p-3 ${param.isCorrect ? 'bg-blue-50' : 'bg-blue-100'} rounded-md`}>
                    <p className="text-sm text-gray-600 mb-1">消歧结果：</p>
                    <p className={param.isCorrect ? 'text-blue-800' : 'text-blue-900'}>
                      {param.disambiguationResult.replace('分许', '分组')}
                    </p>
                  </div>
                )}
              </div>

              {key === 'metric' && (
                <button
                  onClick={() => setShowIntermediateResults(!showIntermediateResults)}
                  className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  {showIntermediateResults ? (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      收起中间结果
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4 mr-1" />
                      查看中间结果
                    </>
                  )}
                </button>
              )}
              
              {key === 'metric' && showIntermediateResults && renderIntermediateResults()}
              
              {!param.isCorrect && (
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      正确的提取信息：
                    </label>
                    <input
                      type="text"
                      value={param.userExtractedInfo}
                      onChange={(e) => handleUserInputChange(key as keyof QueryParameter, 'userExtractedInfo', e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="请输入正确的提取信息..."
                    />
                  </div>
                  
                  {key !== 'calculation' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        正确的消歧结果：
                      </label>
                      <input
                        type="text"
                        value={param.userDisambiguationResult}
                        onChange={(e) => handleUserInputChange(key as keyof QueryParameter, 'userDisambiguationResult', e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="请输入正确的消歧结果..."
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <ActionButtons
          onNext={handleNext}
          onBack={handlePrev}
          disableNext={!canProceed}
          nextText={currentQueryIndex < localData.length - 1 ? "下一个查询" : "提交"}
        />
      </div>

      {showAnnotationModal && currentAnnotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              标注{currentAnnotation.title}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  请输入正确的指标列表（用逗号分隔）：
                </label>
                <textarea
                  value={currentAnnotation.value}
                  onChange={(e) => setCurrentAnnotation({
                    ...currentAnnotation,
                    value: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="请输入正确的指标列表，多个指标用逗号分隔..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAnnotationModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={() => handleAnnotationSave(currentAnnotation.value)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ParameterExtractionStep;