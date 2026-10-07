import PropertyListingCard from "./PropertyCard";

export default function PropertyGrid({ properties }: any) {
    if (!properties || properties.length === 0) {
        return (
            <div className="text-center py-16 text-gray-500">
                No properties found. Try adjusting your filters.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {properties.map((property: any) => (

                <PropertyListingCard property={property} />

            ))}
        </div>
    );
}