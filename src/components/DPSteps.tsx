'use client';

import { DPSteps as DPStepsType } from '@/types';

interface DPStepsProps {
  steps: DPStepsType;
}

const stepInfo = [
  { num: 1, title: 'dp 数组含义', field: 'dpDefinition' as const },
  { num: 2, title: '递推公式', field: 'recurrence' as const },
  { num: 3, title: '初始化', field: 'initialization' as const },
  { num: 4, title: '遍历顺序', field: 'traversalOrder' as const },
  { num: 5, title: '举例推导', field: 'exampleDerivation' as const },
];

export default function DPSteps({ steps }: DPStepsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">动规五步曲</h3>
      <p className="text-sm text-gray-500">
        按照代码随想录的方法，用五步分析动态规划问题
      </p>
      {stepInfo.map(({ num, title, field }) => (
        <div key={num} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
                {num}
              </span>
              <span className="font-medium text-gray-900">{title}</span>
            </div>
          </div>
          <div className="p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {steps[field]}
          </div>
        </div>
      ))}

      {/* Debug tip */}
      <div className="bg-amber-50 rounded-lg border border-amber-100 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-amber-600">💡</span>
          <span className="font-medium text-amber-900">调试技巧</span>
        </div>
        <p className="text-sm text-amber-800 whitespace-pre-wrap leading-relaxed">
          {steps.debugTip}
        </p>
      </div>
    </div>
  );
}
