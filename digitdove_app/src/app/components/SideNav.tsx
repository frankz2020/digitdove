"use client";
import React, { useEffect, useState } from "react";
import NavButton, { HighlightDirection } from "./NavButton";
import { useTheme } from "../providers/ThemeContext";
import { useFormat } from "../providers/FormatContext";
import HomeSVG from "../assets/home.svg";
import BrowseSVG from "../assets/browse.svg";
import CreateSVG from "../assets/create.svg";
import TemplateSVG from "../assets/template.svg";
import CommunitySVG from "../assets/community.svg";
import SyncSVG from "../assets/syncSpace.svg";
import SettingSVG from "../assets/setting.svg";
import BellSVG from "../assets/bell.svg";
import HelpSVG from "../assets/helpMessage.svg";
import SearchBar from "./Searchbar";
import { useRouter, usePathname } from "next/navigation";
export enum ButtonOptions {
  Home,
  Create,
  SyncSpace,
  Browse,
  Template,
  Community,
  Help,
  Bell,
  Setting,
}
const SideNav = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { format } = useFormat();
  const [selectedBtn, setSelectedBtn] = useState(ButtonOptions.Home);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.includes("/home")) {
      setSelectedBtn(ButtonOptions.Home);
    } else if (pathname.startsWith("/create")) {
      setSelectedBtn(ButtonOptions.Create);
    } else if (pathname.startsWith("/syncSpace")) {
      setSelectedBtn(ButtonOptions.SyncSpace);
    }else if (pathname.startsWith("/browse")) {
      setSelectedBtn(ButtonOptions.Browse);
    } else if (pathname.startsWith("/template")) {
      setSelectedBtn(ButtonOptions.Template);
    } else if (pathname.startsWith("/community")) {
      setSelectedBtn(ButtonOptions.Community);
    } else {
      setSelectedBtn(ButtonOptions.Home);
    }
  }, [pathname]);
  return (

      <div
        className="flex flex-col h-full gap-4 border-r-2 pt-5"
        style={{
          borderColor: theme.neutual200,
          backgroundColor: theme.neutral100,
          // width: format.sideNavbarWidth,
          // maxWidth: format.maxSideNavbarWidth,
          // minWidth: format.minSideNavbarWidth,
          // height: `calc(100vh - ${format.topNavbarHeight})`,
        }}
      >
        <NavButton
          name="Home"
          highlightDirection={HighlightDirection.Left}
          selected={selectedBtn == ButtonOptions.Home}
          onClick={() => {
            setSelectedBtn(ButtonOptions.Home);
            router.push("/home");
          }}
          SvgIcon={HomeSVG}
        />
        <NavButton
          name="Create"
          highlightDirection={HighlightDirection.Left}
          selected={selectedBtn == ButtonOptions.Create}
          onClick={() => {
            setSelectedBtn(ButtonOptions.Create);
            router.push("/create");
          }}
          SvgIcon={CreateSVG}
        />
        <NavButton
          name="SyncSpace"
          highlightDirection={HighlightDirection.Left}
          selected={selectedBtn == ButtonOptions.SyncSpace}
          onClick={() => {
            setSelectedBtn(ButtonOptions.SyncSpace);
            router.push("/syncSpace");
          }}
          SvgIcon={SyncSVG}
        />
        <NavButton
          name="Browse"
          highlightDirection={HighlightDirection.Left}
          selected={selectedBtn == ButtonOptions.Browse}
          onClick={() => {
            setSelectedBtn(ButtonOptions.Browse);
            router.push("/browse");
          }}
          SvgIcon={BrowseSVG}
        />
        <NavButton
          name="Template"
          highlightDirection={HighlightDirection.Left}
          selected={selectedBtn == ButtonOptions.Template}
          onClick={() => {
            setSelectedBtn(ButtonOptions.Template);
            router.push("/template");
          }}
          SvgIcon={TemplateSVG}
        />
        <NavButton
          name="Community"
          highlightDirection={HighlightDirection.Left}
          selected={selectedBtn == ButtonOptions.Community}
          onClick={() => {
            setSelectedBtn(ButtonOptions.Community);
            router.push("/community");
          }}
          SvgIcon={CommunitySVG}
        />
      </div>
  );
};

export default SideNav;
