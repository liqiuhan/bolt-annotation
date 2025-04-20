import { useState } from 'react';
import AnnotationHeader from './components/AnnotationHeader';
import ContextIntegrationStep from './components/steps/ContextIntegrationStep';
import QueryDecompositionStep from './components/steps/QueryDecompositionStep';
import ParameterExtractionStep from './components/steps/ParameterExtractionStep';
import ProgressBar from './components/ProgressBar';
import SuccessScreen from './components/SuccessScreen';

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [annotations, setAnnotations] = useState({
    contextIntegration: {
      originalQuery: '业绩城市为天津，各大区今年每月德佑、KA合计二手佣金、单量、GTV是多少？按佣金降序取前3',
      followUpQuery: '武汉的呢？',
      systemIntegration: '业绩城市为武汉，各大区今年每月德佑、KA合计二手佣金、单量、GTV是多少？',
      userChoice: '',
      userSuggestion: ''
    },
    queryDecomposition: {
      originalQuery: '业绩城市为武汉，各大区今年每月德佑、KA合计二手佣金、单量、GTV是多少？',
      decomposedQueries: [
        '业绩城市为武汉，各大区今年每月德佑、KA合计"二手佣金"是多少，按佣金降序取前3？',
        '业绩城市为武汉，各大区今年每月德佑、KA合计"二手单量"是多少？',
        '业绩城市为武汉，各大区今年每月德佑、KA合计"二手GTV"是多少？'
      ],
      isCorrect: true,
      userDecomposition: []
    },
    parameterExtractions: [
      {
        query: '业绩城市为武汉，各大区今年每月德佑、KA合计"二手佣金"是多少，按佣金降序取前3？',
        parameters: {
          metric: {
            extractedInfo: '佣金',
            disambiguationResult: '61535：总新签佣金',
            isCorrect: true,
            userExtractedInfo: '',
            userDisambiguationResult: '',
            intermediateResults: {
              filteredByGoldenRules: [
                '买卖岗位经纪人人均佣金',
                '新房岗位经纪人人均佣金',
                '总考核佣金收入',
                '人均佣金人效比',
                '总考核分边佣金收入',
                '实时新房认购佣金收入',
                '实时租赁佣金收入',
                '门店层店均佣金',
                '考核收入目标完成率',
                '门店层人均佣金',
                '实时二手佣金收入',
                '综合回款天数',
                '租赁岗位经纪人人均佣金',
                '新房认购未成销佣金',
                '综合业绩排名'
              ],
              filteredByDimensions: ['丢盘佣金量'],
              initialMetrics: [
                '总新签佣金',
                '二手买卖纯新签套均佣金',
                '新房认购套均佣金',
                '应收佣金打折率',
                '新房认购佣金_签约维度',
                '过户单实收佣金打折率',
                '丢盘佣金量',
                '新房净增认购佣金-签约维度'
              ],
              filteredByExactMatch: [],
              disambiguationSteps: [
                '新房认购套均佣金',
                '应收佣金打折率',
                '新房认购佣金_签约维度',
                '过户单实收佣金打折率',
                '新房净增认购佣金-签约维度',
                '总新签佣金',
                '二手买卖纯新签套均佣金'
              ]
            }
          },
          timeRange: {
            extractedInfo: '今年',
            disambiguationResult: 'between 2024Ys and 0d',
            isCorrect: true,
            userExtractedInfo: '',
            userDisambiguationResult: ''
          },
          constraints: {
            extractedInfo: '"业绩城市:武汉","二手","德佑","KA"',
            disambiguationResult: '业绩城市performance_city_name in ("武汉")；子品牌sub_brand_name in （"德佑","KA"）;业务类型del_type_name in ("二手")',
            isCorrect: true,
            userExtractedInfo: '',
            userDisambiguationResult: ''
          },
          groupBy: {
            extractedInfo: '每月，各大区',
            disambiguationResult: '按"月：month"，"大区：area_name"进行分组',
            isCorrect: true,
            userExtractedInfo: '',
            userDisambiguationResult: ''
          },
          sorting: {
            extractedInfo: '排序指标：佣金，降序，取top3',
            disambiguationResult: '排序指标："新签佣金"，降序，top3',
            isCorrect: true,
            userExtractedInfo: '',
            userDisambiguationResult: ''
          },
          calculation: {
            extractedInfo: '合计',
            disambiguationResult: '',
            isCorrect: true,
            userExtractedInfo: '',
            userDisambiguationResult: ''
          }
        }
      },
      {
        query: '业绩城市为武汉，各大区今年每月德佑、KA合计"二手单量"是多少？',
        parameters: {
          metric: {
            extractedInfo: '单量',
            disambiguationResult: '61536：总新签单量',
            isCorrect: true,
            userExtractedInfo: '',
            userDisambiguationResult: '',
            intermediateResults: {
              filteredByGoldenRules: [
                '买卖岗位经纪人人均佣金',
                '新房岗位经纪人人均佣金',
                '总考核佣金收入',
                '人均佣金人效比',
                '总考核分边佣金收入',
                '实时新房认购佣金收入',
                '实时租赁佣金收入',
                '门店层店均佣金',
                '考核收入目标完成率',
                '门店层人均佣金',
                '实时二手佣金收入',
                '综合回款天数',
                '租赁岗位经纪人人均佣金',
                '新房认购未成销佣金',
                '综合业绩排名'
              ],
              filteredByDimensions: ['丢盘佣金量'],
              initialMetrics: [
                '总新签佣金',
                '二手买卖纯新签套均佣金',
                '新房认购套均佣金',
                '应收佣金打折率',
                '新房认购佣金_签约维度',
                '过户单实收佣金打折率',
                '丢盘佣金量',
                '新房净增认购佣金-签约维度'
              ],
              filteredByExactMatch: [],
              disambiguationSteps: [
                '新房认购套均佣金',
                '应收佣金打折率',
                '新房认购佣金_签约维度',
                '过户单实收佣金打折率',
                '新房净增认购佣金-签约维度',
                '总新签佣金',
                '二手买卖纯新签套均佣金'
              ]
            }
          },
          timeRange: {
            extractedInfo: '今年',
            disambiguationResult: 'between 2024Ys and 0d',
            isCorrect: true,
            userExtractedInfo: '',
            userDisambiguationResult: ''
          },
          constraints: {
            extractedInfo: '"业绩城市:武汉","二手","德佑","KA"',
            disambiguationResult: '业绩城市performance_city_name in ("武汉")；子品牌sub_brand_name in （"德佑","KA"）;业务类型del_type_name in ("二手")',
            isCorrect: true,
            userExtractedInfo: '',
            userDisambiguationResult: ''
          },
          groupBy: {
            extractedInfo: '每月，各大区',
            disambiguationResult: '按"月：month"，"大区：area_name"进行分组',
            isCorrect: true,
            userExtractedInfo: '',
            userDisambiguationResult: ''
          },
          sorting: {
            extractedInfo: '',
            disambiguationResult: '',
            isCorrect: true,
            userExtractedInfo: '',
            userDisambiguationResult: ''
          },
          calculation: {
            extractedInfo: '合计',
            disambiguationResult: '',
            isCorrect: true,
            userExtractedInfo: '',
            userDisambiguationResult: ''
          }
        }
      },
      {
        query: '业绩城市为武汉，各大区今年每月德佑、KA合计"二手GTV"是多少？',
        parameters: {
          metric: {
            extractedInfo: 'GTV',
            disambiguationResult: '61537：总新签GTV',
            isCorrect: true,
            userExtractedInfo: '',
            userDisambiguationResult: '',
            intermediateResults: {
              filteredByGoldenRules: [
                '买卖岗位经纪人人均佣金',
                '新房岗位经纪人人均佣金',
                '总考核佣金收入',
                '人均佣金人效比',
                '总考核分边佣金收入',
                '实时新房认购佣金收入',
                '实时租赁佣金收入',
                '门店层店均佣金',
                '考核收入目标完成率',
                '门店层人均佣金',
                '实时二手佣金收入',
                '综合回款天数',
                '租赁岗位经纪人人均佣金',
                '新房认购未成销佣金',
                '综合业绩排名'
              ],
              filteredByDimensions: ['丢盘佣金量'],
              initialMetrics: [
                '总新签佣金',
                '二手买卖纯新签套均佣金',
                '新房认购套均佣金',
                '应收佣金打折率',
                '新房认购佣金_签约维度',
                '过户单实收佣金打折率',
                '丢盘佣金量',
                '新房净增认购佣金-签约维度'
              ],
              filteredByExactMatch: [],
              disambiguationSteps: [
                '新房认购套均佣金',
                '应收佣金打折率',
                '新房认购佣金_签约维度',
                '过户单实收佣金打折率',
                '新房净增认购佣金-签约维度',
                '总新签佣金',
                '二手买卖纯新签套均佣金'
              ]
            }
          },
          timeRange: {
            extractedInfo: '今年',
            disambiguationResult: 'between 2024Ys and 0d',
            isCorrect: true,
            userExtractedInfo: '',
            userDisambiguationResult: ''
          },
          constraints: {
            extractedInfo: '"业绩城市:武汉","二手","德佑","KA"',
            disambiguationResult: '业绩城市performance_city_name in ("武汉")；子品牌sub_brand_name in （"德佑","KA"）;业务类型del_type_name in ("二手")',
            isCorrect: true,
            userExtractedInfo: '',
            userDisambiguationResult: ''
          },
          groupBy: {
            extractedInfo: '每月，各大区',
            disambiguationResult: '按"月：month"，"大区：area_name"进行分组',
            isCorrect: true,
            userExtractedInfo: '',
            userDisambiguationResult: ''
          },
          sorting: {
            extractedInfo: '',
            disambiguationResult: '',
            isCorrect: true,
            userExtractedInfo: '',
            userDisambiguationResult: ''
          },
          calculation: {
            extractedInfo: '合计',
            disambiguationResult: '',
            isCorrect: true,
            userExtractedInfo: '',
            userDisambiguationResult: ''
          }
        }
      }
    ],
    completed: false
  });

  const totalSteps = 3;
  
  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setAnnotations({ ...annotations, completed: true });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateAnnotations = (step, data) => {
    setAnnotations({
      ...annotations,
      [step]: data
    });
  };

  const renderCurrentStep = () => {
    if (annotations.completed) {
      return <SuccessScreen />;
    }

    switch (currentStep) {
      case 0:
        return (
          <ContextIntegrationStep 
            data={annotations.contextIntegration} 
            onUpdate={(data) => updateAnnotations('contextIntegration', data)}
            onNext={handleNextStep} 
          />
        );
      case 1:
        return (
          <QueryDecompositionStep 
            data={annotations.queryDecomposition} 
            onUpdate={(data) => updateAnnotations('queryDecomposition', data)}
            onNext={handleNextStep} 
            onPrev={handlePrevStep}
          />
        );
      case 2:
        return (
          <ParameterExtractionStep 
            data={annotations.parameterExtractions} 
            onUpdate={(data) => updateAnnotations('parameterExtractions', data)}
            onNext={handleNextStep} 
            onPrev={handlePrevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AnnotationHeader />
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        <div className="mt-8">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
}

export default App;