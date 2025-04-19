import { MessageSquare } from 'lucide-react';

const AnnotationHeader = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-800">ChatBI 查询标注工具</h1>
        </div>
        <div className="text-sm text-gray-500">
          帮助我们提高查询智能化水平
        </div>
      </div>
    </header>
  );
};

export default AnnotationHeader;