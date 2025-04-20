import { CheckCircle, Award } from 'lucide-react';
import Card from './ui/Card';

const SuccessScreen = () => {
  // Mock points calculation based on annotation complexity
  const points = 100;

  return (
    <Card>
      <div className="text-center py-8">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">标注已提交成功！</h2>
        <div className="flex items-center justify-center mb-6 bg-amber-50 p-4 rounded-lg">
          <Award className="w-6 h-6 text-amber-500 mr-2" />
          <p className="text-amber-700 font-medium">
            恭喜您获得了 <span className="text-amber-600 text-xl font-bold">{points}</span> 积分
          </p>
        </div>
        <p className="text-gray-600 mb-8">
          感谢您的耐心标注，您的反馈将帮助我们提高 ChatBI 的智能化水平。
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