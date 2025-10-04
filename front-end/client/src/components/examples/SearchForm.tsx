import SearchForm from '../SearchForm';

export default function SearchFormExample() {
  return (
    <div className="p-6">
      <SearchForm 
        onSearch={(city, radius) => console.log('Search:', city, radius)} 
      />
    </div>
  );
}
