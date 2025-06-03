import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { getCurrentUser } from "@/lib/appwrite";
import PathfinderSurvey from "./PathfinderSurvey";
import TrailblazerSurvey from "./TrailblazerSurvey";
import HorizonChangerSurvey from "./HorizonChangerSurvey";

const CareerSurvey = () => {
   const [careerStage, setCareerStage] = useState<string | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     const fetchData = async () => {
       const user = await getCurrentUser();
       if (user) {
         setCareerStage(user.careerStage);
       }
       setLoading(false);
     };
     fetchData();
   }, []);

   if (loading) {
     return (
       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
         <ActivityIndicator size="large" color="#0000ff" />
       </View>
     );
   }

   switch (careerStage) {
     case "Pathfinder":
       return <PathfinderSurvey />;
     case "Trailblazer":
       return <TrailblazerSurvey />;
     case "Horizon Changer":
       return <HorizonChangerSurvey />;
     default:
       return (
         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
           <Text>Unknown career stage</Text>
         </View>
       );
   }
};

export default CareerSurvey;