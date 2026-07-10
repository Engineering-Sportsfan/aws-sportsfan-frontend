"use client";
import MediaTabsComponent from "@/src/components/sportsfan360-profile-component/sportsfancontent";
import Sportsfan360ProfileHeader from "@/src/components/sportsfan360-profile-component/sportsfanheader";

export default function SportsfanProfile() {
  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-6">
      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Profile Header */}
        <div className="lg:col-span-1">
          <Sportsfan360ProfileHeader />
        </div>

        {/* Right Side - Content Tabs */}
        <div className="lg:col-span-2 mt-0 lg:mt-70 mb-15">
          <MediaTabsComponent />
        </div>
      </div>
    </div>
  );
}