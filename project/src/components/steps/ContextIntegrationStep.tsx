import { useState, useEffect } from 'react';
import ActionButtons from '../ui/ActionButtons';
import Card from '../ui/Card';

interface ContextIntegrationData {
  originalQuery: string;
  followUpQuery: string;
  systemIntegration: string;
  userChoice: string;
  userSuggestion: string;
}

interface ContextIntegrationStepProps {
  data: ContextIntegrationData;
  onUpdate: (data: ContextIntegrationData) => void;
  onNext: () => void;
}

const ContextIntegrationStep = ({ data, onUpdate, onNext }: ContextIntegrationStepProps) => {
  const [localData, setLocalData] = useState<ContextIntegrationData>(data);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    setCanProceed(localData.userChoice !== '' && 
      (localData.userChoice !== 'C' || (localData.userChoice === 'C' && localData.userSuggestion !== '')));
  }, [localData]);

  const handleOptionSelect = (option: string) => {
    setLocalData({
      ...localData,
      userChoice: option
    });
    setShowCustomInput(option === 'C');
  };

  const handleSuggestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalData({
      ...localData,
      userSuggestion: e.target.value
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">查询上下文整合标注</h2>
          <p className="text-gray-600 mb-4">
            请评估系统对于上下文的整合是否正确。根据历史查询和新查询，系统进行了上下文理解和整合。
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-gray-500 mb-1">您上次查询的是：</p>
            <p className="text-blue-800 font-medium">{localData.originalQuery}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-md">
            <p className="text-sm text-gray-500 mb-1">您现在查询的是：</p>
            <p className="text-purple-800 font-medium">{localData.followUpQuery}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-sm text-gray-500 mb-1">系统理解整合后的查询为：</p>
            <p className="text-green-800 font-medium">{localData.systemIntegration}</p>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <p className="font-medium text-gray-700">请选择最符合您意图的选项：</p>
          
          <div className="space-y-2">
            <div 
              className={`border rounded-md p-3 cursor-pointer transition-colors ${
                localData.userChoice === 'A' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleOptionSelect('A')}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border ${
                  localData.userChoice === 'A' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                } flex items-center justify-center mr-3`}>
                  {localData.userChoice === 'A' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-gray-700">A：整合正确</span>
              </div>
            </div>
            
            <div 
              className={`border rounded-md p-3 cursor-pointer transition-colors ${
                localData.userChoice === 'B' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleOptionSelect('B')}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border ${
                  localData.userChoice === 'B' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                } flex items-center justify-center mr-3`}>
                  {localData.userChoice === 'B' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-gray-700">B：不要整合</span>
              </div>
            </div>
            
            <div 
              className={`border rounded-md p-3 cursor-pointer transition-colors ${
                localData.userChoice === 'C' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleOptionSelect('C')}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full border ${
                  localData.userChoice === 'C' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                } flex items-center justify-center mr-3`}>
                  {localData.userChoice === 'C' && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-gray-700">C：应该整合成其他内容</span>
              </div>
            </div>
          </div>
          
          {showCustomInput && (
            <div className="mt-4 transition-all duration-300 ease-in-out">
              <label htmlFor="suggestion" className="block text-sm font-medium text-gray-700 mb-1">
                请填写正确的整合内容：
              </label>
              <textarea
                id="suggestion"
                rows={3}
                value={localData.userSuggestion}
                onChange={handleSuggestionChange}
                className="w-full border border-gray-300 rounded-md p-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入您认为正确的整合内容..."
              />
            </div>
          )}
        </div>

        <ActionButtons
          onNext={handleNext}
          disableNext={!canProceed}
          hideBack
        />
      </div>
    </Card>
  );
};

export default ContextIntegrationStep;