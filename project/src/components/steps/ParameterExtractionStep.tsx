import { useState, useEffect } from 'react';
import ActionButtons from '../ui/ActionButtons';
import Card from '../ui/Card';

interface ParameterData {
  extractedInfo: string;
  disambiguationResult: string;
  isCorrect: boolean;
  userExtractedInfo: string;
  userDisambiguationResult: string;
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
                <div className={`p-3 ${param.isCorrect ? 'bg-green-50' : 'bg-amber-50'} rounded-md`}>
                  <p className="text-sm text-gray-600 mb-1">提取到的信息：</p>
                  <p className={param.isCorrect ? 'text-green-800' : 'text-amber-800'}>
                    {param.extractedInfo}
                  </p>
                </div>
                
                {param.disambiguationResult && (
                  <div className={`p-3 ${param.isCorrect ? 'bg-green-50' : 'bg-amber-50'} rounded-md`}>
                    <p className="text-sm text-gray-600 mb-1">消歧结果：</p>
                    <p className={param.isCorrect ? 'text-green-800' : 'text-amber-800'}>
                      {param.disambiguationResult}
                    </p>
                  </div>
                )}
              </div>
              
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
    </Card>
  );
};

export default ParameterExtractionStep;