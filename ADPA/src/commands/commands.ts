import { insertBlueParagraphInWord } from "./word-production";
import {
  convertToAdobePDF,
  convertProjectCharter,
  convertTechnicalSpec,
  convertBusinessReq,
  convertToInDesignLayout,
  generateIllustratorDiagrams,
  generateMultiFormatPackage
} from "./word";

/* global Office */

// Register the add-in commands with the Office host application.
Office.onReady(async () => {
  Office.actions.associate("action", insertBlueParagraphInWord);
  Office.actions.associate("convertToAdobePDF", convertToAdobePDF);
  Office.actions.associate("convertProjectCharter", convertProjectCharter);
  Office.actions.associate("convertTechnicalSpec", convertTechnicalSpec);
  Office.actions.associate("convertBusinessReq", convertBusinessReq);
  Office.actions.associate("convertInDesign", convertToInDesignLayout);
  Office.actions.associate("generateDiagrams", generateIllustratorDiagrams);
  Office.actions.associate("multiFormatPackage", generateMultiFormatPackage);
});
