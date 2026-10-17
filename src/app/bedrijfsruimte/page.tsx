import { SearchPage, searchMetadata, type SearchParams } from '@/components/search-page';

export const generateMetadata = ({ searchParams }: { searchParams: SearchParams }) => searchMetadata('bedrijfsruimte', searchParams);

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return <SearchPage mode="bedrijfsruimte" searchParams={searchParams} />;
}
