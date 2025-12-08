import React from "react";
import * as FaIcons from "react-icons/fa";
import IconWrapper from "./IconWrapper";

// Create wrapped versions of all FontAwesome icons
type IconProps = {
  className?: string;
  size?: number;
  title?: string;
  onClick?: () => void;
};

// Helper function to create wrapped icons
const createWrappedIcon = (IconComponent: any) => {
  return ({ className, size, onClick, title }: IconProps) => (
    <IconWrapper
      icon={React.createElement(IconComponent)}
      className={className}
      size={size}
      onClick={onClick}
      title={title}
    />
  );
};

// Export all Font Awesome icons wrapped in our IconWrapper
export const FaTwitter = createWrappedIcon(FaIcons.FaTwitter);
export const FaFacebook = createWrappedIcon(FaIcons.FaFacebook);
export const FaLinkedin = createWrappedIcon(FaIcons.FaLinkedin);
export const FaInstagram = createWrappedIcon(FaIcons.FaInstagram);
export const FaGithub = createWrappedIcon(FaIcons.FaGithub);
export const FaChartLine = createWrappedIcon(FaIcons.FaChartLine);
export const FaChevronDown = createWrappedIcon(FaIcons.FaChevronDown);
export const FaUser = createWrappedIcon(FaIcons.FaUser);
export const FaHistory = createWrappedIcon(FaIcons.FaHistory);
export const FaCog = createWrappedIcon(FaIcons.FaCog);
export const FaSignOutAlt = createWrappedIcon(FaIcons.FaSignOutAlt);
export const FaSearch = createWrappedIcon(FaIcons.FaSearch);
export const FaCheckCircle = createWrappedIcon(FaIcons.FaCheckCircle);
export const FaUsers = createWrappedIcon(FaIcons.FaUsers);
export const FaCode = createWrappedIcon(FaIcons.FaCode);
export const FaPaperPlane = createWrappedIcon(FaIcons.FaPaperPlane);
export const FaMapMarkerAlt = createWrappedIcon(FaIcons.FaMapMarkerAlt);
export const FaPhone = createWrappedIcon(FaIcons.FaPhone);
export const FaEnvelope = createWrappedIcon(FaIcons.FaEnvelope);
export const FaExternalLinkAlt = createWrappedIcon(FaIcons.FaExternalLinkAlt);
export const FaDownload = createWrappedIcon(FaIcons.FaDownload);
export const FaTrashAlt = createWrappedIcon(FaIcons.FaTrashAlt);
export const FaChartBar = createWrappedIcon(FaIcons.FaChartBar);
export const FaShieldAlt = createWrappedIcon(FaIcons.FaShieldAlt);
export const FaSearchPlus = createWrappedIcon(FaIcons.FaSearchPlus);
export const FaGoogle = createWrappedIcon(FaIcons.FaGoogle);
export const FaLock = createWrappedIcon(FaIcons.FaLock);
export const FaRocket = createWrappedIcon(FaIcons.FaRocket);
export const FaExclamationTriangle = createWrappedIcon(
  FaIcons.FaExclamationTriangle
);
export const FaArrowLeft = createWrappedIcon(FaIcons.FaArrowLeft);
export const FaMobileAlt = createWrappedIcon(FaIcons.FaMobileAlt);
export const FaInfoCircle = createWrappedIcon(FaIcons.FaInfoCircle);
export const FaKey = createWrappedIcon(FaIcons.FaKey);
export const FaBell = createWrappedIcon(FaIcons.FaBell);
export const FaSave = createWrappedIcon(FaIcons.FaSave);
export const FaHome = createWrappedIcon(FaIcons.FaHome);
export const FaClock = createWrappedIcon(FaIcons.FaClock);
export const FaPlus = createWrappedIcon(FaIcons.FaPlus);
export const FaCreditCard = createWrappedIcon(FaIcons.FaCreditCard);
