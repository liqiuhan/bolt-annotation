import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, Edit2, EyeOff, Eye, Copy, Search, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
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

const steps = [
  { key: 'metric', label: '指标' },
  { key: 'timeRange', label: '时间范围' },
  { key: 'constraints', label: '约束条件' },
  { key: 'groupBy', label: '分组条件' },
  { key: 'sorting', label: '排序条件' },
  { key: 'calculation', label: '计算方式' }
];

const parameterLabels: Record<keyof QueryParameter, string> = {
  metric: '指标',
  timeRange: '时间范围',
  constraints: '约束条件',
  groupBy: '分组条件',
  sorting: '排序条件',
  calculation: '计算方式'
};

const mockMetrics = [
  { id: '61535', name: '总新签佣金' },
  { id: '61536', name: '总新签单量' },
  { id: '61537', name: '总新签GTV' },
  { id: '61538', name: '新房认购套均佣金' },
  { id: '61539', name: '应收佣金打折率' },
];

const mockDimensions = [
  '业绩城市',
  '大区',
  '子品牌',
  '业务类型',
  '月份',
  '季度',
  '年份',
];

const ParameterExtractionStep = ({ data, onUpdate, onNext, onPrev }: ParameterExtractionStepProps) => {
  const [localData, setLocalData] = useState<QueryExtractionData[]>(data);
  const [currentQueryIndex, setCurrentQueryIndex] = useState(0);
  const [canProceed, setCanProceed] = useState(true);
  const [showIntermediateResults, setShowIntermediateResults] = useState(false);
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [showDisambiguation, setShowDisambiguation] = useState(true);
  const [currentAnnotation, setCurrentAnnotation] = useState<{
    title: string;
    key: keyof IntermediateResults;
    value: string;
  } | null>(null);
  const [metricSearch, setMetricSearch] = useState('');
  const [showMetricSuggestions, setShowMetricSuggestions] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [constraints, setConstraints] = useState<Array<{ dimension: string; operator: string; values: string }>>([]);
  const [groupByDimensions, setGroupByDimensions] = useState<string[]>([]);
  const [sortingConfig, setSortingConfig] = useState({ order: 'desc', type: 'top', limit: 3 });

  const parameterRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const currentQuery = localData[currentQueryIndex];

  useEffect(() => {
    const allValid = Object.entries(currentQuery.parameters).every(
      ([_, param]) => param.isCorrect || (!param.isCorrect && param.userExtractedInfo.trim() !== '' && param.userDisambiguationResult.trim() !== '')
    );
    setCanProceed(allValid);
  }, [currentQuery]);

  const scrollToParameter = (key: string) => {
    const element = parameterRefs.current[key];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

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

  const handleSyncAnnotation = (key: keyof QueryParameter) => {
    const updatedData = [...localData];
    const firstQueryParam = localData[0].parameters[key];
    const currentParam = updatedData[currentQueryIndex].parameters[key];

    currentParam.isCorrect = firstQueryParam.isCorrect;
    currentParam.userExtractedInfo = firstQueryParam.userExtractedInfo;
    currentParam.userDisambiguationResult = firstQueryParam.userDisambiguationResult;

    setLocalData(updatedData);
  };

  const handleMetricSelect = (metric: { id: string; name: string }) => {
    handleUserInputChange('metric', 'userDisambiguationResult', `${metric.id}：${metric.name}`);
    setShowMetricSuggestions(false);
    setMetricSearch('');
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

  const renderCustomInput = (key: keyof QueryParameter) => {
    if (key === 'metric') {
      return (
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              value={metricSearch}
              onChange={(e) => {
                setMetricSearch(e.target.value);
                setShowMetricSuggestions(true);
              }}
              className="w-full border border-gray-300 rounded-md p-2 pr-8 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
              placeholder="搜索指标..."
            />
            <Search className="absolute right-2 top-2.5 w-4 h-4 text-gray-400" />
          </div>
          {showMetricSuggestions && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
              {mockMetrics
                .filter(m => 
                  m.name.toLowerCase().includes(metricSearch.toLowerCase()) ||
                  m.id.includes(metricSearch)
                )
                .map(metric => (
                  <div
                    key={metric.id}
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleMetricSelect(metric)}
                  >
                    {metric.id}：{metric.name}
                  </div>
                ))}
            </div>
          )}
          {currentQuery.parameters.metric.userDisambiguationResult && (
            <div className="mt-2 p-2 bg-blue-50 rounded-md">
              {currentQuery.parameters.metric.userDisambiguationResult}
            </div>
          )}
        </div>
      );
    }

    if (key === 'timeRange') {
      return (
        <div className="flex gap-2 items-center">
          <DatePicker
            selected={dateRange[0]}
            onChange={(date) => setDateRange([date, dateRange[1]])}
            selectsStart
            startDate={dateRange[0]}
            endDate={dateRange[1]}
            className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
            placeholderText="开始日期"
            dateFormat="yyyy-MM-dd"
          />
          <span className="text-gray-500">至</span>
          <DatePicker
            selected={dateRange[1]}
            onChange={(date) => {
              setDateRange([dateRange[0], date]);
              if (dateRange[0] && date) {
                handleUserInputChange(
                  'timeRange',
                  'userDisambiguationResult',
                  `between ${dateRange[0].toISOString().split('T')[0]} and ${date.toISOString().split('T')[0]}`
                );
              }
            }}
            selectsEnd
            startDate={dateRange[0]}
            endDate={dateRange[1]}
            minDate={dateRange[0]}
            className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
            placeholderText="结束日期"
            dateFormat="yyyy-MM-dd"
          />
        </div>
      );
    }

    if (key === 'constraints') {
      return (
        <div className="space-y-2">
          {constraints.map((constraint, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select
                value={constraint.dimension}
                onChange={(e) => {
                  const newConstraints = [...constraints];
                  newConstraints[index].dimension = e.target.value;
                  setConstraints(newConstraints);
                  handleUserInputChange(
                    'constraints',
                    'userDisambiguationResult',
                    newConstraints.map(c => `${c.dimension} ${c.operator} (${c.values})`).join('; ')
                  );
                }}
                className="flex-1 border border-gray-300 rounded-md p-2"
              >
                <option value="">选择维度</option>
                {mockDimensions.map(dim => (
                  <option key={dim} value={dim}>{dim}</option>
                ))}
              </select>
              <select
                value={constraint.operator}
                onChange={(e) => {
                  const newConstraints = [...constraints];
                  newConstraints[index].operator = e.target.value;
                  setConstraints(newConstraints);
                  handleUserInputChange(
                    'constraints',
                    'userDisambiguationResult',
                    newConstraints.map(c => `${c.dimension} ${c.operator} (${c.values})`).join('; ')
                  );
                }}
                className="w-32 border border-gray-300 rounded-md p-2"
              >
                <option value="in">包含</option>
                <option value="not in">不包含</option>
              </select>
              <input
                type="text"
                value={constraint.values}
                onChange={(e) => {
                  const newConstraints = [...constraints];
                  newConstraints[index].values = e.target.value;
                  setConstraints(newConstraints);
                  handleUserInputChange(
                    'constraints',
                    'userDisambiguationResult',
                    newConstraints.map(c => `${c.dimension} ${c.operator} (${c.values})`).join('; ')
                  );
                }}
                className="flex-1 border border-gray-300 rounded-md p-2"
                placeholder="输入枚举值，用逗号分隔"
              />
              <button
                onClick={() => {
                  const newConstraints = constraints.filter((_, i) => i !== index);
                  setConstraints(newConstraints);
                  handleUserInputChange(
                    'constraints',
                    'userDisambiguationResult',
                    newConstraints.map(c => `${c.dimension} ${c.operator} (${c.values})`).join('; ')
                  );
                }}
                className="p-2 text-gray-500 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              setConstraints([...constraints, { dimension: '', operator: 'in', values: '' }]);
            }}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            + 添加约束条件
          </button>
        </div>
      );
    }

    if (key === 'groupBy') {
      return (
        <div className="space-y-2">
          {groupByDimensions.map((dimension, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select
                value={dimension}
                onChange={(e) => {
                  const newDimensions = [...groupByDimensions];
                  newDimensions[index] = e.target.value;
                  setGroupByDimensions(newDimensions);
                  handleUserInputChange(
                    'groupBy',
                    'userDisambiguationResult',
                    `按"${newDimensions.join('","')}"进行分组`
                  );
                }}
                className="flex-1 border border-gray-300 rounded-md p-2"
              >
                <option value="">选择维度</option>
                {mockDimensions.map(dim => (
                  <option key={dim} value={dim}>{dim}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  const newDimensions = groupByDimensions.filter((_, i) => i !== index);
                  setGroupByDimensions(newDimensions);
                  handleUserInputChange(
                    'groupBy',
                    'userDisambiguationResult',
                    `按"${newDimensions.join('","')}"进行分组`
                  );
                }}
                className="p-2 text-gray-500 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              setGroupByDimensions([...groupByDimensions, '']);
            }}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            + 添加分组维度
          </button>
        </div>
      );
    }

    if (key === 'sorting') {
      return (
        <div className="flex gap-2 items-center">
          <select
            value={sortingConfig.order}
            onChange={(e) => {
              const newConfig = { ...sortingConfig, order: e.target.value };
              setSortingConfig(newConfig);
              handleUserInputChange(
                'sorting',
                'userDisambiguationResult',
                `${newConfig.order === 'asc' ? '升序' : '降序'}, ${newConfig.type} ${newConfig.limit}`
              );
            }}
            className="w-24 border border-gray-300 rounded-md p-2"
          >
            <option value="asc">升序</option>
            <option value="desc">降序</option>
          </select>
          <select
            value={sortingConfig.type}
            onChange={(e) => {
              const newConfig = { ...sortingConfig, type: e.target.value };
              setSortingConfig(newConfig);
              handleUserInputChange(
                'sorting',
                'userDisambiguationResult',
                `${newConfig.order === 'asc' ? '升序' : '降序'}, ${newConfig.type} ${newConfig.limit}`
              );
            }}
            className="w-24 border border-gray-300 rounded-md p-2"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
          </select>
          <input
            type="number"
            value={sortingConfig.limit}
            onChange={(e) => {
              const newConfig = { ...sortingConfig, limit: parseInt(e.target.value) };
              setSortingConfig(newConfig);
              handleUserInputChange(
                'sorting',
                'userDisambiguationResult',
                `${newConfig.order === 'asc' ? '升序' : '降序'}, ${newConfig.type} ${newConfig.limit}`
              );
            }}
            className="w-24 border border-gray-300 rounded-md p-2"
            min="1"
          />
        </div>
      );
    }

    if (key === 'calculation') {
      return (
        <div className="flex gap-2 items-center">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={currentQuery.parameters.calculation.userExtractedInfo === '合计'}
              onChange={(e) => {
                handleUserInputChange(
                  'calculation',
                  'userExtractedInfo',
                  e.target.checked ? '合计' : ''
                );
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>合计</span>
          </label>
        </div>
      );
    }

    return null;
  };

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">槽位提取和消歧</h2>
            <button
              onClick={() => setShowDisambiguation(!showDisambiguation)}
              className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {showDisambiguation ? (
                <>
                  <EyeOff className="w-4 h-4 mr-1.5" />
                  折叠消歧结果
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-1.5" />
                  展开消歧结果
                </>
              )}
            </button>
          </div>
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

        <div className="flex gap-6">
          <div className="w-24 shrink-0 sticky top-0 self-start">
            <div className="space-y-1">
              {steps.map((step, index) => {
                const param = currentQuery.parameters[step.key as keyof QueryParameter];
                const isCompleted = param.isCorrect || (!param.isCorrect && param.userExtractedInfo && param.userDisambiguationResult);

                return (
                  <div key={step.key} className="relative">
                    <button
                      onClick={() => scrollToParameter(step.key)}
                      className="w-full flex flex-col items-center p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="relative">
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <span className="text-xs text-gray-600 text-center mt-1 leading-tight">
                        {step.label}
                      </span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 h-4 w-0.5 bg-gray-200">
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 rotate-45 w-2 h-2 border-r-2 border-b-2 border-gray-200" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {Object.entries(currentQuery.parameters).map(([key, param]) => (
              <div
                key={key}
                ref={el => parameterRefs.current[key] = el}
                className="border border-gray-200 rounded-md p-4"
              >
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
                    {currentQueryIndex > 0 && key !== 'metric' && (
                      <button
                        onClick={() => handleSyncAnnotation(key as keyof QueryParameter)}
                        className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        同步查询①标注
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className={`p-3 ${param.isCorrect ? 'bg-purple-50' : 'bg-purple-100'} rounded-md`}>
                    <p className="text-sm text-gray-600 mb-1">提取到的信息：</p>
                    <p className={param.isCorrect ? 'text-purple-800' : 'text-purple-900'}>
                      {param.extractedInfo}
                    </p>
                  </div>
                  
                  {param.disambiguationResult && showDisambiguation && (
                    <div className={`p-3 ${param.isCorrect ? 'bg-blue-50' : 'bg-blue-100'} rounded-md transition-all duration-200`}>
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
                    
                    {key !== 'calculation' && showDisambiguation && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          正确的消歧结果：
                        </label>
                        {renderCustomInput(key as keyof QueryParameter)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
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