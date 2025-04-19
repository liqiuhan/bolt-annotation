import { CheckCircle } from 'lucide-react';
import Card from './ui/Card';

const SuccessScreen = () => {
  return (
    <Card>
      <div className="text-center py-6">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">标注已提交成功！</h2>
        <p className="text-gray-600 mb-6">
          感谢您的宝贵反馈，您的标注将帮助我们提高 ChatBI 的智能化水平。
        </p>
        <button 
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => window.location.reload()}
        >
          开始新的标注
        </button>
      </div>
    </Card>
  );
};

export default SuccessScreen;