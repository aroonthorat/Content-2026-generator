
import React from 'react';
import { QuestionData } from '../types';
import CheckIcon from './icons/CheckIcon';

interface QuestionDisplayProps {
  questionData: QuestionData;
  highlightedOption: string | null;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = React.memo(({ questionData, highlightedOption }) => {
  return (
    <div className="space-y-6 relative">
      <h2 className="text-2xl sm:text-3xl font-bold text-textMain text-center">
        {questionData.question}
      </h2>
      <ul className="space-y-3 pt-4">
        {questionData.options.map((option) => {
          const isHighlighted = highlightedOption === option.letter;
          return (
            <li
              key={option.letter}
              className={`flex items-center p-4 rounded-lg border transition-all duration-300 ${
                isHighlighted 
                  ? 'bg-accent/20 border-accent scale-105 shadow-lg shadow-accent/20' 
                  : 'bg-black/20 border-border hover:bg-black/40 hover:border-primary'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white transition-colors ${isHighlighted ? 'bg-accent' : 'bg-secondary'}`}>
                {option.letter}
              </div>
              <span className={`ml-4 text-lg ${isHighlighted ? 'text-accent' : 'text-textMain'}`}>{option.text}</span>
              {isHighlighted && (
                <div className="ml-auto text-accent">
                  <CheckIcon />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
});

export default QuestionDisplay;
