import bookmark from "../assets/icons/bookmark.png";
import home from "../assets/icons/home.png";
import plus from "../assets/icons/plus.png";
import profile from "../assets/icons/profile.png";
import leftArrow from "../assets/icons/left-arrow.png";
import menu from "../assets/icons/menu.png";
import search from "../assets/icons/search.png";
import upload from "../assets/icons/upload.png";
import rightArrow from "../assets/icons/right-arrow.png";
import logout from "../assets/icons/logout.png";
import eyeHide from "../assets/icons/eye-hide.png";
import eye from "../assets/icons/eye.png";
import play from "../assets/icons/play.png";

interface Icons {
  play: any; // Replace `any` with the correct type (e.g., `ImageSourcePropType`)
  bookmark: any;
  home: any;
  plus: any;
  profile: any;
  leftArrow: any;
  menu: any;
  search: any;
  upload: any;
  rightArrow: any;
  logout: any;
  eyeHide: any;
  eye: any;
}

const icons: Icons = {
  play,
  bookmark,
  home,
  plus,
  profile,
  leftArrow,
  menu,
  search,
  upload,
  rightArrow,
  logout,
  eyeHide,
  eye,
};

export default icons;