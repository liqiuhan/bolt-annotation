import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import ActionButtons from '../ui/ActionButtons';
import Card from '../ui/Card';

interface QueryDecompositionData {
  originalQuery: string;
  decomposedQueries: string[];
  isCorrect: boolean;
  userDecomposition: string[];
}

interface QueryDecompositionStepProps {
  data: QueryDecompositionData;
  onUpdate: (data: QueryDecompositionData) => void;
  onNext: () => void;
  onPrev: () => void;
}

const QueryDecompositionStep = ({ data, onUpdate, onNext, onPrev }: QueryDecompositionStepProps) => {
  const [localData, setLocalData] = useState<QueryDecompositionData>(data);
  const [customQuery, setCustomQuery] = useState('');
  const [canProceed, setCanProceed] = useState(true);

  useEffect(() => {
    setCanProceed(localData.isCorrect || localData.userDecomposition.length > 0);
  }, [localData]);

  const handleOptionChange = (value: boolean) => {
    setLocalData({
      ...localData,
      isCorrect: value,
      userDecomposition: value ? [] : localData.userDecomposition
    });
  };

  const handleAddCustomQuery = () => {
    if (customQuery.trim() !== '') {
      setLocalData({
        ...localData,
        userDecomposition: [...localData.userDecomposition, customQuery.trim()]
      });
      setCustomQuery('');
    }
  };

  const handleRemoveCustomQuery = (index: number) => {
    const updatedQueries = [...localData.userDecomposition];
    updatedQueries.splice(index, 1);
    setLocalData({
      ...localData,
      userDecomposition: updatedQueries
    });
  };

  const handleNext = () => {
    onUpdate(localData);
    onNext();
  };

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">查询拆解标注</h2>
          <p className="text-gray-600 mb-4">
            请评估系统对多指标查询的拆解是否正确：
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-md">
          <p className="text-sm text-gray-500 mb-1">原始查询：</p>
          <p className="text-blue-800 font-medium">{localData.originalQuery}</p>
        </div>

        <div className="space-y-3">
          <p className="font-medium text-gray-700">系统拆解结果：</p>
          <div className="space-y-2">
            {localData.decomposedQueries.map((query, index) => (
              <div key={index} className="bg-green-50 p-3 rounded-md">
                <p className="text-green-800">
                  <span className="font-medium mr-2">{index + 1}.</span>
                  {query}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <p className="font-medium text-gray-700">拆解结果是否正确？</p>
          <div className="space-y-2">
            <div 
              className={`border rounded-md p-3 cursor-pointer transition-colors ${
                localData.isCorrect ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleOptionChange(true)}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border ${
                  localData.isCorrect ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                } flex items-center justify-center mr-3`}>
                  {localData.isCorrect && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-gray-700">A：正确</span>
              </div>
            </div>
            
            <div 
              className={`border rounded-md p-3 cursor-pointer transition-colors ${
                !localData.isCorrect ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleOptionChange(false)}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border ${
                  !localData.isCorrect ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                } flex items-center justify-center mr-3`}>
                  {!localData.isCorrect && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-gray-700">B：不正确，应该按如下方式拆解</span>
              </div>
            </div>
          </div>
        </div>

        {!localData.isCorrect && (
          <div className="space-y-3 transition-all duration-300 ease-in-out">
            <div className="space-y-2">
              {localData.userDecomposition.map((query, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-grow bg-purple-50 p-3 rounded-md mr-2">
                    <p className="text-purple-800">
                      <span className="font-medium mr-2">{index + 1}.</span>
                      {query}
                    </p>
                  </div>
                  <button 
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    onClick={() => handleRemoveCustomQuery(index)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex mt-2">
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                className="flex-grow border border-gray-300 rounded-l-md p-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入正确的拆解查询..."
              />
              <button
                className="bg-blue-600 text-white px-3 rounded-r-md hover:bg-blue-700 transition-colors flex items-center"
                onClick={handleAddCustomQuery}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <ActionButtons
          onNext={handleNext}
          onBack={onPrev}
          disableNext={!canProceed}
        />
      </div>
    </Card>
  );
};

export default QueryDecompositionStep;