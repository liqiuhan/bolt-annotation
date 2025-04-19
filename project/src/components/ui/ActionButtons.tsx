interface ActionButtonsProps {
  onNext: () => void;
  onBack?: () => void;
  disableNext?: boolean;
  hideBack?: boolean;
  nextText?: string;
}

const ActionButtons = ({ 
  onNext, 
  onBack, 
  disableNext = false,
  hideBack = false,
  nextText = "下一步" 
}: ActionButtonsProps) => {
  return (
    <div className="flex justify-between pt-4">
      {!hideBack && onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          上一步
        </button>
      ) : (
        <div></div>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={disableNext}
        className={`py-2 px-6 rounded-md text-white transition-colors ${
          disableNext 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {nextText}
      </button>
    </div>
  );
};

export default ActionButtons;