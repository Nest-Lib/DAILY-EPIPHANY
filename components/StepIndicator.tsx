import React from 'react';
import { Eye, Link2, Sparkles, Check } from 'lucide-react';

interface Props {
  currentStep: 1 | 2 | 3;
}

export const StepIndicator: React.FC<Props> = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'Observe', icon: Eye },
    { num: 2, label: 'Connect', icon: Link2 },
    { num: 3, label: 'Discover', icon: Sparkles },
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-6 mb-8">
      <div className="relative flex items-center justify-between">
        {/* Connecting Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-800 -z-10"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-500 transition-all duration-700 ease-in-out -z-10"
          style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        ></div>

        {steps.map((step) => {
          const isActive = step.num === currentStep;
          const isCompleted = step.num < currentStep;
          const Icon = isCompleted ? Check : step.icon;

          return (
            <div key={step.num} className="flex flex-col items-center gap-2 group">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10
                  ${isActive || isCompleted 
                    ? 'bg-slate-900 border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                    : 'bg-slate-900 border-slate-700 text-slate-600'}
                  ${isActive ? 'scale-110' : 'scale-100'}
                `}
              >
                <Icon className={`w-5 h-5 ${isCompleted ? 'text-green-400' : ''} transition-all duration-300`} />
              </div>
              <span 
                className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300
                  ${isActive ? 'text-indigo-300' : isCompleted ? 'text-slate-400' : 'text-slate-600'}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};