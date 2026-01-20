import { Suspense } from 'react';
import MarketplaceSearchContent from './MarketplaceSearchContent';

export default function MarketplaceSearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MarketplaceSearchContent />
        </Suspense>
    );
}
