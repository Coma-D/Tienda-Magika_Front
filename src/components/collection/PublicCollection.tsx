import React from 'react';
import { Collection } from './Collection';
import { useCollection } from '../../hooks/useCollection';

interface PublicCollectionProps {
  userId: string;
  userName: string;
  onBack: () => void;
  availableSets: string[];
}

export const PublicCollection: React.FC<PublicCollectionProps> = ({ 
  userId, 
  userName, 
  onBack, 
  availableSets 
}) => {
  // Cargamos la colección del OTRO usuario pasando su ID
  const otherUserCollection = useCollection(userId);

  return (
    <Collection 
      collection={otherUserCollection}
      catalogSets={availableSets}
      isOwner={false} // IMPORTANTE: Modo solo lectura
      userName={userName}
      onBack={onBack}
    />
  );
};