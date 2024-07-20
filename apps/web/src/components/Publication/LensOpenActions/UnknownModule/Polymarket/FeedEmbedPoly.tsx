import React from 'react';
import type { OG } from '@lensshare/types/misc';
import type { AnyPublication, MirrorablePublication } from '@lensshare/lens';

interface FeedEmbedProps {
  og: OG;
  publication: AnyPublication | MirrorablePublication;
}
const FeedEmbedPoly: React.FC<FeedEmbedProps> = ({ og, publication }) => {
  return (
    <div className="feed-embed">
      <h2>{og.title}</h2>
      <img src={og.image || '/images/placeholder.png'} alt={og.title || 'Polymarket Market'} />
      <p>{og.description}</p>
      {/* Add more details and actions related to the Polymarket market */}
    </div>
  );
};

export default FeedEmbedPoly;