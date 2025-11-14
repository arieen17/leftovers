import { View, ScrollView, Linking, TouchableOpacity } from "react-native";
import { MapPin, Navigation, ExternalLink } from "lucide-react-native";
import { AppText } from "@/components/AppText";
import { TopBar } from "@/components/TopBar";

export default function MapScreen() {
  const restaurants = [
    {
      id: 1,
      name: "Glasgow Residential Restaurant",
      address: "University Ave, Riverside, CA 92507",
      mapsUrl:
        "https://www.google.com/maps/place/Glasgow+Residential+Restaurant/@33.9782042,-117.3267553,17.47z/data=!4m6!3m5!1s0x80dcaf4a9460aa9f:0x599807798ee90541!8m2!3d33.9781411!4d-117.3247733!16s%2Fg%2F11hgktvtn5?entry=ttu&g_ep=EgoyMDI1MTEwNC4xIKXMDSoASAFQAw%3D%3D",
      type: "Dining Hall",
    },
    {
      id: 2,
      name: "Habit Burger & Grill",
      address: "900 University Ave, Riverside, CA 92507",
      mapsUrl:
        "https://www.google.com/maps/place/Habit+Burger+%26+Grill/@33.9782717,-117.3661023,13z/data=!4m10!1m2!2m1!1shabit!3m6!1s0x80dcae442ff66eab:0x440dea935e35b196!8m2!3d33.9745924!4d-117.3282352!15sCgVoYWJpdCIDiAEBWgciBWhhYml0kgEUaGFtYnVyZ2VyX3Jlc3RhdXJhbnTgAQA!16s%2Fg%2F11f2cl46hl?entry=ttu&g_ep=EgoyMDI1MTEwNC4xIKXMDSoASAFQAw%3D%3D",
      type: "American",
    },
    {
      id: 3,
      name: "Subway",
      address: "1201 University Ave, Riverside, CA 92507",
      mapsUrl:
        "https://www.google.com/maps/place/Subway/@33.9784003,-117.3661023,13z/data=!4m10!1m2!2m1!1ssubway!3m6!1s0x80dcae44241ece55:0xd19614e5b46014a0!8m2!3d33.974747!4d-117.3280505!15sCgZzdWJ3YXkiA4gBAVoIIgZzdWJ3YXmSAQ1zYW5kd2ljaF9zaG9wmgEkQ2hkRFNVaE5NRzluUzBWSlEwRm5TVVF0ZG5adUxYZG5SUkFC4AEA-gEECAAQEA!16s%2Fg%2F12hn4nbll?entry=ttu&g_ep=EgoyMDI1MTEwNC4xIKXMDSoASAFQAw%3D%3D",
      type: "Sandwiches",
    },
    {
      id: 4,
      name: "Starbucks",
      address: "1101 University Ave, Riverside, CA 92507",
      mapsUrl:
        "https://www.google.com/maps/place/Starbucks/@33.9785289,-117.3661024,13z/data=!3m1!5s0x80dcae598cb73c63:0x84e2ac15212ca05e!4m10!1m2!2m1!1sstarbucks!3m6!1s0x80dcae59eb17b7a5:0xe7c6b00b5e37df8!8m2!3d33.9756!4d-117.32104!15sCglzdGFyYnVja3MiA4gBAVoLIglzdGFyYnVja3OSAQtjb2ZmZWVfc2hvcOABAA!16s%2Fg%2F11c2kbj7tv?entry=ttu&g_ep=EgoyMDI1MTEwNC4xIKXMDSoASAFQAw%3D%3D",
      type: "Coffee",
    },
    {
      id: 5,
      name: "Panda Express",
      address: "1150 University Ave, Riverside, CA 92507",
      mapsUrl:
        "https://www.google.com/maps/place/Panda+Express/@33.9787681,-117.4897115,11z/data=!4m10!1m2!2m1!1spanda+express!3m6!1s0x80dcae44241ec8a5:0xa64ed8d40f7432a5!8m2!3d33.974215!4d-117.3288349!15sCg1wYW5kYSBleHByZXNzIgOIAQFaDyINcGFuZGEgZXhwcmVzc5IBEmNoaW5lc2VfcmVzdGF1cmFudOABAA!16s%2Fg%2F1tmcmjm6?entry=ttu&g_ep=EgoyMDI1MTEwNC4xIKXMDSoASAFQAw%3D%3D",
      type: "Chinese",
    },
    {
      id: 6,
      name: "The Coffee Bean & Tea Leaf",
      address: "University Ave, Riverside, CA 92507",
      mapsUrl:
        "https://www.google.com/maps/place/The+Coffee+Bean+%26+Tea+Leaf/@33.9743967,-117.3275972,16z/data=!4m6!3m5!1s0x80dcae4424048eb5:0x1256b0aa2a263d56!8m2!3d33.9745289!4d-117.3280718!16s%2Fg%2F1thx8y0m?entry=ttu&g_ep=EgoyMDI1MTEwNC4xIKXMDSoASAFQAw%3D%3D",
      type: "Coffee",
    },
  ];

  // Open actual restaurant page in Google Maps
  const openRestaurantInGoogleMaps = (mapsUrl: string) => {
    Linking.openURL(mapsUrl);
  };

  // Open UCR campus map
  const openCampusMap = () => {
    const url =
      "https://www.google.com/maps/place/University+of+California,+Riverside/@33.9745,-117.3281,16z/data=!4m6!3m5!1s0x80dcb1d5dfe85377:0x5a6ba4686e3c7f6e!8m2!3d33.9745!4d-117.3281!16s%2Fm%2F0k3p_yf?entry=ttu";
    Linking.openURL(url);
  };

  return (
    <View className="flex-1 bg-blue">
      <TopBar />
      <ScrollView className="flex-1">
        {/* Interactive Map Header */}
        <TouchableOpacity onPress={openCampusMap}>
          <View
            style={{
              width: "100%",
              height: 200,
              backgroundColor: "#1E40AF",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Navigation size={40} color="white" />
            <AppText bold className="text-white text-center mt-2">
              UCR Campus Map
            </AppText>
            <AppText size="small" className="text-white text-center mt-1">
              Tap to explore campus in Google Maps
            </AppText>
            <View
              style={{
                marginTop: 15,
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: "white",
                borderRadius: 25,
              }}
            >
              <AppText size="small" bold className="text-blue-800">
                Open Campus Map
              </AppText>
            </View>
          </View>
        </TouchableOpacity>

        {/* Restaurant List */}
        <View className="px-4 py-4">
          <View className="flex-row items-center mb-4 gap-2">
            <MapPin size={24} />
            <AppText bold className="mb-0">
              Campus Restaurants
            </AppText>
          </View>

          <View className="gap-3">
            {restaurants.map((restaurant) => (
              <TouchableOpacity
                key={restaurant.id}
                onPress={() => openRestaurantInGoogleMaps(restaurant.mapsUrl)}
              >
                <View className="bg-[#96AFD9] rounded-lg p-4 border border-[#E5E5D5]">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <AppText size="medium" bold>
                        {restaurant.name}
                      </AppText>
                      <AppText size="small" className="text-gray-600 mt-1">
                        {restaurant.address}
                      </AppText>
                      <AppText size="small" className="text-blue-800 mt-1">
                        {restaurant.type}
                      </AppText>
                    </View>
                    <ExternalLink size={16} color="#1E40AF" />
                  </View>

                  {/* Action Button */}
                  <View className="flex-row items-center mt-3 pt-2 border-t border-gray-300">
                    <MapPin size={14} color="#1E40AF" />
                    <AppText size="small" className="text-blue-600 ml-1">
                      Open in Google Maps →
                    </AppText>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
