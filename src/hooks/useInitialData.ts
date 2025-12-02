// src/hooks/useInitialData.ts
import { useState, useEffect } from 'react';
import { Card, MarketplaceListing } from '../types';
import { mockCards } from '../data/mockData';

export const useInitialData = () => {
  // 1. Catálogo
  const [catalogCards, setCatalogCards] = useState<Card[]>(() => {
    const saved = localStorage.getItem('catalogCards');
    return saved ? JSON.parse(saved) : mockCards;
  });

  // 2. Marketplace Listings
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>(() => {
    const saved = localStorage.getItem('marketplaceListings');
    return saved ? JSON.parse(saved) : []; 
  });

  // 3. Sets Disponibles
  const [availableSets, setAvailableSets] = useState<string[]>(() => {
    const saved = localStorage.getItem('availableSets');
    return saved ? JSON.parse(saved) : [
      'Colección Básica 2024', 'Alpha', 'Beta', 'Unlimited', 
      'Arabian Nights', 'Antiquities', 'Legends', 'The Dark'
    ];
  });

  // Fetch del Catálogo
  useEffect(() => {
    const fetchCatalog = async () => {
        try {
            const res = await fetch('/api/v1/cards/catalog');
            if (res.ok) {
                const data = await res.json();
                setCatalogCards(data); 
            }
        } catch (error) {
            console.warn("API catalog fetch failed, using local.", error);
        }
    };
    fetchCatalog();
  }, []);

  // Fetch del Marketplace
  useEffect(() => {
    const fetchListings = async () => {
        try {
            const res = await fetch('/api/v1/marketplace/listings');
            if (res.ok) {
                const data = await res.json();
                setMarketplaceListings(data); 
            }
        } catch (error) {
            console.warn("API listings fetch failed.", error);
        }
    };
    fetchListings();
  }, []);

  // Persistencia LocalStorage
  useEffect(() => { localStorage.setItem('catalogCards', JSON.stringify(catalogCards)); }, [catalogCards]);
  useEffect(() => { localStorage.setItem('marketplaceListings', JSON.stringify(marketplaceListings)); }, [marketplaceListings]);
  useEffect(() => { localStorage.setItem('availableSets', JSON.stringify(availableSets)); }, [availableSets]);

  return {
    catalogCards, setCatalogCards,
    marketplaceListings, setMarketplaceListings,
    availableSets, setAvailableSets
  };
};