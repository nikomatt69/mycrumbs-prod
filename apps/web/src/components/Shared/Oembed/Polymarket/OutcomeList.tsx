
import { Outcome } from '@lensshare/types/polymarket';
import React from 'react';


interface OutcomeListProps {
  outcomes: Outcome[];
}

const OutcomeList: React.FC<OutcomeListProps> = ({ outcomes }) => {
  return (
    <div>
      {outcomes.map((outcome, index) => (
        <p key={index}>{outcome.name} - Current Price: {outcome.price}</p>
      ))}
    </div>
  );
};

export default OutcomeList;
    