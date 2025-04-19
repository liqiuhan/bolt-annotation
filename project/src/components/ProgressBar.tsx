interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  const steps = [
    { name: '上下文整合', description: '验证查询整合是否正确' },
    { name: '查询拆解', description: '验证多指标拆解是否正确' },
    { name: '槽位提取和消歧', description: '验证槽位提取和消歧是否准确' }
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div 
              className={`flex flex-col items-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <div className="relative">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-sm transition-all duration-200 ${
                    index < currentStep 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : index === currentStep 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
              </div>
              <div className="mt-2 text-sm font-medium text-center">{step.name}</div>
              <div className="mt-1 text-xs hidden md:block text-center">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="flex items-center w-full relative">
                  <div 
                    className={`h-[2px] w-full transition-all duration-200 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    style={{
                      background: index < currentStep 
                        ? 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)' 
                        : 'linear-gradient(90deg, #d1d5db 0%, #e5e7eb 100%)'
                    }}
                  />
                  <div 
                    className={`absolute right-0 w-3 h-3 transform rotate-45 border-t-2 border-r-2 translate-x-[1px] transition-all duration-200 ${
                      index < currentStep 
                        ? 'border-blue-500' 
                        : 'border-gray-300'
                    }`}
                    style={{
                      boxShadow: '1px -1px 0 rgba(0,0,0,0.05)'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;