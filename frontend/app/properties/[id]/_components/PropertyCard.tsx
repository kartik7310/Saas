import { formatPrice } from "@/lib/utils";

export default function PropertyListingCard({ property }: any) {
    return (
        <div className="bg-white rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">

            {/* Property Image */}
            <div className="overflow-hidden">
                <img
                    src={property.image}
                    alt={property.title}
                    className="w-full object-cover hover:scale-105 transition-transform duration-300"
                    style={{ height: "150px" }}
                />
            </div>

            {/* Card Body */}
            <div className="p-3">

                {/* Title */}
                <h3 className="font-bold text-gray-900 text-base mb-2">
                    {property.title}
                </h3>

                {/* BHK | Area row */}
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <span>{property.bhk}</span>
                    <span className="text-gray-300">|</span>
                    <span>{property.area}</span>
                </div>

                {/* Amenities */}
                <p className="text-gray-600 text-sm font-semibold mb-3">
                    {property.amenities}
                </p>

                {/* Divider */}
                <div className="border-t border-gray-100 mb-3" />

                {/* Price + CTA row */}
                <div className="flex items-center justify-between gap-2">
                    <p className="text-gray-700 text-sm">
                        Starting <span className="font-bold text-gray-900">{formatPrice(property.price)}</span>
                    </p>

                </div>
            </div>
        </div>
    );
}