// "use client";

// import ContinueListening from "@/src/components/HomeComponents/ContinueListening/index";
// import CricketArticles from "@/src/components/HomeComponents/CricketArticles/index";
// import Header from "@/src/components/HomeComponents/Header/index";
// import HomeBanners from "@/src/components/HomeComponents/HomeBanners/index";
// import HomeCardsSection from "@/src/components/HomeComponents/HomeCards";
// import Player360CardsSection from "@/src/components/HomeComponents/Player360Cards";
// import Team360CardsSection from "@/src/components/HomeComponents/Team360Cards";

// export default function HomePage() {
//   return (
//     <div className="flex flex-col w-full">
//       <Header />
//       <div className="flex flex-col gap-6 px-4 lg:px-6 py-4 w-full">
//         <HomeBanners />
//         {/* <ContinueListening /> */}
//         <HomeCardsSection />
//         <Team360CardsSection />
//         <Player360CardsSection  />
//         <CricketArticles />
//       </div>
//     </div>
//   );
// }

"use client";

import ContinueListening from "@/src/components/HomeComponents/ContinueListening/index";
// Removed Header import from here
import HomeBanners from "@/src/components/HomeComponents/HomeBanners/index";
import HomeCardsSection from "@/src/components/HomeComponents/HomeCards";
import Player360CardsSection from "@/src/components/HomeComponents/Player360Cards";
import Team360CardsSection from "@/src/components/HomeComponents/Team360Cards";
import PollCardsPage from "../PollCards/page";
import NewsCenter from "@/src/components/HomeComponents/NewsCenter";
import IPLSpotlight from "../IPLSpotlight/page";
import SocialFeedSection from "@/src/components/CreatePost-Component/SocialFeedSection";
import FifaWorldSection from "@/src/components/HomeComponents/FifaWorldSection";
import NewHomePage from "@/src/components/NewHomePageComponent/newhomepage";

import WPLPlayerPage from "../Wplplayer360/page";
import FifaPlayerProfilePage from "../FifaPlayer360/page";
import WomensT20Section from "@/src/components/HomeComponents/WomensT20Section";
import FifaClub360Page from "../FifaClub360/page";
import WT20Club360CardsSection from "../WT20WC360/page";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* <Header /> -> REMOVED to prevent duplication with layout.tsx */}
      <div className="flex flex-col gap-6 px-4 lg:px-6 py-4 w-full">
        {/* <HomeBanners />
        <IPLSpotlight />
        <WomensT20Section/>
        <FifaWorldSection />

        <ContinueListening />
      
         */}
         {/* <IPLSpotlight /> */}
         {/* <PollCardsPage /> */}
        <NewHomePage />
          {/* <HomeCardsSection /> */}
        {/* <Team360CardsSection /> */}
        {/* <PlayerProfilePage /> */}
        <WPLPlayerPage />
        <FifaPlayerProfilePage />
        <WT20Club360CardsSection />
        <FifaClub360Page />
        {/* <Player360CardsSection /> */}
         <SocialFeedSection />
        <NewsCenter /> 
      </div>
    </div>
  );
}
