import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCheck,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  Layers,
  Printer,
  Ruler,
  ShieldCheck,
  Shirt,
  Sparkles,
  SwatchBook,
  Truck,
  Upload,
  UserRound,
  WandSparkles,
} from "lucide-react";

const colors = [
  { name: "Porcelain", value: "#f3eee5" },
  { name: "Dune Rose", value: "#c88e8a" },
  { name: "Olive Mist", value: "#8d9a80" },
  { name: "Midnight Ink", value: "#21364a" },
  { name: "Espresso", value: "#3d3027" },
  { name: "Burnished Gold", value: "#b2874e" },
  { name: "Mulberry", value: "#6f435e" },
  { name: "Slate Blue", value: "#5d708e" },
];

const fabricTypes = ["Cotton", "Silk", "Linen", "Chiffon", "Lace", "Wool"];
const textures = ["Smooth", "Crisp", "Soft", "Ribbed", "Sheer", "Structured"];
const patterns = ["Plain", "Stripes", "Check", "Floral"];
const genders = ["Female", "Male"];
const collectionModes = ["Pickup", "Delivery"];
const uploadLimitBytes = 6 * 1024 * 1024;

const styleTemplates = {
  Female: [
    { name: "A-line dress", complexity: 1.2, labor: 18000, days: 4, silhouette: "Balanced and easy to fit through waist and hip." },
    { name: "Blouse and skirt", complexity: 1.1, labor: 16000, days: 3, silhouette: "Versatile two-piece option for daywear collections." },
    { name: "Jumpsuit", complexity: 1.35, labor: 22000, days: 5, silhouette: "Requires careful rise and length calibration." },
    { name: "Evening gown", complexity: 1.68, labor: 32000, days: 7, silhouette: "Formal drape-led style suited for premium fabrics." },
  ],
  Male: [
    { name: "Native set", complexity: 1.22, labor: 17000, days: 4, silhouette: "Relaxed ceremonial set with forgiving ease." },
    { name: "Long sleeve shirt", complexity: 1.0, labor: 12000, days: 2, silhouette: "Fast turnaround staple for clean shirting fabrics." },
    { name: "Kaftan", complexity: 1.28, labor: 19000, days: 4, silhouette: "Roomy line with emphasis on shoulder and length." },
    { name: "Two-piece suit", complexity: 1.72, labor: 38000, days: 8, silhouette: "Most exacting fit with higher pressing and finishing time." },
  ],
};

const styleYardageProfiles = {
  "A-line dress": { base: 2.15, chest: 0.012, hip: 0.021, length: 0.041, sleeve: 0.006, shoulder: 0.007, fullness: 0.35 },
  "Blouse and skirt": { base: 2.0, chest: 0.018, hip: 0.018, length: 0.028, sleeve: 0.009, shoulder: 0.008, fullness: 0.2 },
  Jumpsuit: { base: 2.55, chest: 0.016, hip: 0.021, length: 0.046, sleeve: 0.013, shoulder: 0.008, fullness: 0.45 },
  "Evening gown": { base: 3.15, chest: 0.014, hip: 0.026, length: 0.064, sleeve: 0.007, shoulder: 0.007, fullness: 0.9 },
  "Native set": { base: 2.45, chest: 0.019, hip: 0.014, length: 0.037, sleeve: 0.015, shoulder: 0.011, fullness: 0.32 },
  "Long sleeve shirt": { base: 1.75, chest: 0.021, hip: 0.01, length: 0.032, sleeve: 0.019, shoulder: 0.012, fullness: 0.08 },
  Kaftan: { base: 2.65, chest: 0.017, hip: 0.014, length: 0.044, sleeve: 0.014, shoulder: 0.011, fullness: 0.42 },
  "Two-piece suit": { base: 3.05, chest: 0.022, hip: 0.017, length: 0.038, sleeve: 0.017, shoulder: 0.016, fullness: 0.72 },
};

const patternClasses = {
  Plain: "pattern-plain",
  Stripes: "pattern-stripes",
  Check: "pattern-check",
  Floral: "pattern-floral",
};

const measurementConfig = [
  { key: "chest", label: "Chest", min: 24, max: 70 },
  { key: "waist", label: "Waist", min: 22, max: 65 },
  { key: "hip", label: "Hip", min: 26, max: 75 },
  { key: "shoulder", label: "Shoulder", min: 10, max: 30 },
  { key: "sleeve", label: "Sleeve", min: 12, max: 40 },
  { key: "length", label: "Length", min: 20, max: 75 },
];

const initialMeasurements = {
  chest: "38",
  waist: "32",
  hip: "40",
  shoulder: "16",
  sleeve: "23",
  length: "42",
};

const formatMoney = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const statHighlights = [
  { label: "Tailoring logic", value: "Rule-based cost, yardage, and lead-time engine" },
  { label: "Studio workflow", value: "Fabric scan, fit calibration, and order prep in one surface" },
  { label: "Output quality", value: "Cleaner hierarchy, stronger contrast, and print-friendly summary" },
];

const conversionStats = [
  { label: "Fit checkpoints", value: "6 measurement fields" },
  { label: "Reference inputs", value: "2 visual uploads" },
  { label: "Decision output", value: "1 print-ready estimate" },
];

const workflowSteps = [
  {
    step: "01",
    title: "Capture fabric context",
    detail: "Upload the cloth image and let the surface infer tonal balance and texture before you discuss pricing.",
  },
  {
    step: "02",
    title: "Lock the fit brief",
    detail: "Enter range-guarded measurements so the recommendation stays credible enough for studio and client review.",
  },
  {
    step: "03",
    title: "Share a cleaner estimate",
    detail: "Print or review yardage, lead time, and finishing costs in a format that is easier to defend operationally.",
  },
];

function clampValue(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toDisplayFileSize(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function sanitizeMeasurements(measurements) {
  return measurementConfig.reduce((accumulator, field) => {
    const parsed = Number.parseFloat(measurements[field.key]);
    accumulator[field.key] = Number.isFinite(parsed) ? clampValue(parsed, field.min, field.max) : field.min;
    return accumulator;
  }, {});
}

function validateUpload(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image uploads are supported.");
  }

  if (file.size > uploadLimitBytes) {
    throw new Error(`Please upload an image smaller than ${toDisplayFileSize(uploadLimitBytes)}.`);
  }
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result);
    reader.onerror = () => reject(new Error("The selected image could not be read."));
    reader.readAsDataURL(file);
  });
}

function analyzeImageSignal(src, size = 64) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d", { willReadFrequently: true });

      if (!context) {
        reject(new Error("Image analysis is unavailable in this browser."));
        return;
      }

      context.drawImage(image, 0, 0, size, size);
      const { data } = context.getImageData(0, 0, size, size);
      let red = 0;
      let green = 0;
      let blue = 0;
      let luminanceTotal = 0;
      let contrastTotal = 0;
      let edgeTotal = 0;
      let topLuminance = 0;
      let bottomLuminance = 0;

      const getPixelIndex = (x, y) => (y * size + x) * 4;

      for (let index = 0; index < data.length; index += 4) {
        red += data[index];
        green += data[index + 1];
        blue += data[index + 2];

        const luminance = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
        luminanceTotal += luminance;

        const pixel = index / 4;
        const y = Math.floor(pixel / size);
        if (y < size / 2) {
          topLuminance += luminance;
        } else {
          bottomLuminance += luminance;
        }
      }

      for (let y = 0; y < size - 1; y += 1) {
        for (let x = 0; x < size - 1; x += 1) {
          const currentIndex = getPixelIndex(x, y);
          const rightIndex = getPixelIndex(x + 1, y);
          const bottomIndex = getPixelIndex(x, y + 1);

          const current = data[currentIndex] * 0.299 + data[currentIndex + 1] * 0.587 + data[currentIndex + 2] * 0.114;
          const right = data[rightIndex] * 0.299 + data[rightIndex + 1] * 0.587 + data[rightIndex + 2] * 0.114;
          const bottom = data[bottomIndex] * 0.299 + data[bottomIndex + 1] * 0.587 + data[bottomIndex + 2] * 0.114;

          contrastTotal += Math.abs(current - right);
          edgeTotal += Math.abs(current - right) + Math.abs(current - bottom);
        }
      }

      const pixels = data.length / 4;
      const average = {
        r: Math.round(red / pixels),
        g: Math.round(green / pixels),
        b: Math.round(blue / pixels),
      };
      const brightness = Math.round((average.r + average.g + average.b) / 3);
      const spread = Math.max(average.r, average.g, average.b) - Math.min(average.r, average.g, average.b);
      const averageLuminance = luminanceTotal / pixels;
      const contrast = Math.round(contrastTotal / ((size - 1) * (size - 1)));
      const edgeDensity = Math.round(edgeTotal / (((size - 1) * (size - 1)) * 2));
      const verticalBalance = Number(((bottomLuminance - topLuminance) / Math.max(1, luminanceTotal)).toFixed(3));
      const texture = brightness > 208 ? "Sheer" : brightness < 90 ? "Structured" : brightness < 150 ? "Ribbed" : "Soft";

      resolve({
        color: `rgb(${average.r}, ${average.g}, ${average.b})`,
        brightness,
        spread,
        averageLuminance,
        contrast,
        edgeDensity,
        verticalBalance,
        aspectRatio: Number((image.width / Math.max(1, image.height)).toFixed(2)),
        texture,
      });
    };
    image.onerror = () => reject(new Error("The uploaded image could not be analyzed."));
    image.src = src;
  });
}

function analyzeFabricImage(src) {
  return analyzeImageSignal(src, 56);
}

function analyzeStyleImage(src) {
  return analyzeImageSignal(src, 72);
}

function inferFabricType(signal) {
  const candidates = [
    { name: "Cotton", score: 48 },
    { name: "Silk", score: 50 },
    { name: "Linen", score: 50 },
    { name: "Chiffon", score: 48 },
    { name: "Lace", score: 48 },
    { name: "Wool", score: 46 },
  ];

  const scores = candidates.map((candidate) => {
    let score = candidate.score;

    if (candidate.name === "Chiffon") {
      score += signal.brightness > 205 ? 20 : 0;
      score += signal.texture === "Sheer" ? 22 : 0;
      score += signal.contrast < 18 ? 8 : 0;
    }

    if (candidate.name === "Silk") {
      score += signal.brightness >= 150 && signal.brightness <= 225 ? 12 : 0;
      score += signal.spread > 40 ? 10 : 0;
      score += signal.texture === "Soft" || signal.texture === "Sheer" ? 10 : 0;
      score += signal.edgeDensity < 30 ? 5 : 0;
    }

    if (candidate.name === "Linen") {
      score += signal.texture === "Ribbed" ? 16 : 0;
      score += signal.contrast >= 18 && signal.contrast <= 34 ? 8 : 0;
      score += signal.brightness >= 135 && signal.brightness <= 185 ? 7 : 0;
    }

    if (candidate.name === "Cotton") {
      score += signal.texture === "Soft" || signal.texture === "Ribbed" ? 10 : 0;
      score += signal.brightness >= 120 && signal.brightness <= 185 ? 10 : 0;
      score += signal.spread <= 55 ? 6 : 0;
    }

    if (candidate.name === "Lace") {
      score += signal.edgeDensity >= 30 ? 14 : 0;
      score += signal.contrast >= 20 ? 10 : 0;
      score += signal.brightness > 150 ? 8 : 0;
      score += signal.texture === "Sheer" ? 8 : 0;
    }

    if (candidate.name === "Wool") {
      score += signal.brightness < 130 ? 10 : 0;
      score += signal.texture === "Structured" ? 12 : 0;
      score += signal.contrast >= 20 && signal.contrast <= 38 ? 8 : 0;
      score += signal.edgeDensity < 40 ? 4 : 0;
    }

    return { name: candidate.name, score };
  });

  scores.sort((left, right) => right.score - left.score);
  const winner = scores[0];
  const runnerUp = scores[1];
  const confidence = clampValue(Math.round(62 + (winner.score - runnerUp.score) * 2), 62, 94);

  return {
    type: winner.name,
    confidence,
    alternatives: scores.slice(1, 3).map((item) => item.name),
  };
}

function inferStyleProfile(signal, gender) {
  const styleScores = styleTemplates[gender].map((candidate) => {
    let score = 50;

    if (signal.aspectRatio < 0.85 && ["Evening gown", "Kaftan", "Native set"].includes(candidate.name)) {
      score += 14;
    }

    if (signal.aspectRatio >= 0.85 && signal.aspectRatio <= 1.05 && ["A-line dress", "Long sleeve shirt", "Jumpsuit"].includes(candidate.name)) {
      score += 10;
    }

    if (signal.verticalBalance > 0.08 && ["Evening gown", "A-line dress", "Kaftan"].includes(candidate.name)) {
      score += 12;
    }

    if (signal.edgeDensity > 34 && ["Two-piece suit", "Jumpsuit", "Long sleeve shirt"].includes(candidate.name)) {
      score += 12;
    }

    if (signal.edgeDensity < 28 && ["Evening gown", "Blouse and skirt", "Kaftan"].includes(candidate.name)) {
      score += 8;
    }

    if (signal.contrast > 26 && ["Two-piece suit", "Native set", "Jumpsuit"].includes(candidate.name)) {
      score += 9;
    }

    if (signal.brightness > 175 && ["Evening gown", "Blouse and skirt", "Long sleeve shirt"].includes(candidate.name)) {
      score += 5;
    }

    if (signal.verticalBalance < -0.02 && ["Long sleeve shirt", "Two-piece suit"].includes(candidate.name)) {
      score += 6;
    }

    return { name: candidate.name, score };
  });

  styleScores.sort((left, right) => right.score - left.score);
  const silhouette =
    signal.verticalBalance > 0.08 ? "elongated" : signal.edgeDensity > 34 ? "tailored" : signal.aspectRatio < 0.9 ? "draped" : "balanced";

  return {
    silhouette,
    preferredStyles: styleScores.slice(0, 3).map((item) => item.name),
    confidence: clampValue(Math.round(60 + (styleScores[0].score - styleScores[1].score) * 2), 60, 92),
  };
}

function calculateSummary({ style, fabricType, pattern, texture, measurements, collectionMode, fabricPrice, hasFabricImage, styleInsight }) {
  const profile = styleYardageProfiles[style.name] || styleYardageProfiles["A-line dress"];
  const styleReferenceAllowance =
    styleInsight?.preferredStyles?.[0] === style.name
      ? styleInsight.silhouette === "elongated"
        ? 0.35
        : styleInsight.silhouette === "draped"
          ? 0.25
          : 0.1
      : 0;
  const patternAllowance = pattern === "Plain" ? 0 : pattern === "Floral" ? 0.4 : 0.25;
  const fabricAllowance = ["Chiffon", "Silk", "Lace"].includes(fabricType) ? 0.25 : fabricType === "Wool" ? 0.35 : 0;
  const textureAllowance = texture === "Structured" ? 0.2 : texture === "Sheer" ? 0.3 : 0.1;
  const rawYardage =
    profile.base +
    measurements.chest * profile.chest +
    measurements.hip * profile.hip +
    measurements.length * profile.length +
    measurements.sleeve * profile.sleeve +
    measurements.shoulder * profile.shoulder +
    profile.fullness * style.complexity +
    patternAllowance +
    fabricAllowance +
    textureAllowance +
    styleReferenceAllowance;
  const yardage = Math.ceil(rawYardage * 4) / 4;
  const deliveryFee = collectionMode === "Delivery" ? 3500 : 0;
  const materialEstimate = yardage * fabricPrice;
  const pressingFee = style.complexity > 1.5 ? 4500 : 2000;
  const total = materialEstimate + style.labor + deliveryFee + pressingFee;
  const completionDays = Math.ceil(style.days + (style.complexity > 1.5 ? 1 : 0) + (fabricType === "Wool" ? 1 : 0));
  const confidence = clampValue(
    Math.round(
      72 +
        (hasFabricImage ? 9 : 0) +
        (texture === "Structured" && style.complexity > 1.5 ? 5 : 0) +
        (pattern !== "Plain" ? 3 : 0) -
        ((fabricType === "Chiffon" || fabricType === "Lace") && style.complexity > 1.5 ? 4 : 0)
    ),
    72,
    96
  );

  return {
    yardage,
    completionDays,
    materialEstimate,
    labor: style.labor,
    deliveryFee,
    pressingFee,
    total,
    confidence,
  };
}

function getStyleCompatibilityNote(style, fabricType, texture, pattern, availableYardage, requiredYardage) {
  if (availableYardage > 0 && requiredYardage > availableYardage) {
    return `Needs ${requiredYardage.toFixed(1)} yards, which is above the available ${availableYardage.toFixed(1)} yards.`;
  }

  if (style.name === "Evening gown") {
    return "Best for premium finishing and enough cloth to support drape, lining, and flare.";
  }

  if (style.name === "Two-piece suit") {
    return "Works best when you can support structure, pressing, and fitting checkpoints.";
  }

  if (pattern === "Floral") {
    return "Pattern placement remains manageable without wasting too much cloth.";
  }

  if (texture === "Structured") {
    return `The ${texture.toLowerCase()} hand of this ${fabricType.toLowerCase()} supports this silhouette well.`;
  }

  return `Balanced option for ${fabricType.toLowerCase()} with ${texture.toLowerCase()} handling and standard cutting ease.`;
}

function getTemplateAlignmentScore(candidate, selectedTemplate) {
  const complexityDelta = Math.abs(candidate.complexity - selectedTemplate.complexity);
  const dayDelta = Math.abs(candidate.days - selectedTemplate.days);
  const laborDelta = Math.abs(candidate.labor - selectedTemplate.labor) / 5000;

  return Math.max(0, 18 - complexityDelta * 12 - dayDelta * 1.5 - laborDelta * 2);
}

function getFabricSignalScore(candidate, fabricType, texture, pattern, imageSignal) {
  let score = 0;
  const brightness = imageSignal?.brightness ?? null;
  const spread = imageSignal?.spread ?? 0;

  if (["Silk", "Chiffon"].includes(fabricType) && ["Evening gown", "Blouse and skirt", "A-line dress"].includes(candidate.name)) {
    score += 8;
  }

  if (fabricType === "Wool" && ["Two-piece suit", "Jumpsuit", "Native set", "Long sleeve shirt"].includes(candidate.name)) {
    score += 8;
  }

  if (fabricType === "Lace" && ["Evening gown", "A-line dress", "Blouse and skirt"].includes(candidate.name)) {
    score += 8;
  }

  if (["Cotton", "Linen"].includes(fabricType) && ["Native set", "Kaftan", "Long sleeve shirt", "Blouse and skirt"].includes(candidate.name)) {
    score += 6;
  }

  if (texture === "Structured" && ["Two-piece suit", "Native set", "Jumpsuit"].includes(candidate.name)) {
    score += 6;
  }

  if (texture === "Sheer" && ["Evening gown", "Blouse and skirt", "A-line dress"].includes(candidate.name)) {
    score += 6;
  }

  if (pattern === "Floral" && ["Evening gown", "A-line dress", "Blouse and skirt"].includes(candidate.name)) {
    score += 5;
  }

  if (pattern === "Check" && ["Long sleeve shirt", "Native set", "Two-piece suit"].includes(candidate.name)) {
    score += 4;
  }

  if (brightness !== null) {
    if (brightness > 195 && ["Evening gown", "Blouse and skirt"].includes(candidate.name)) {
      score += 4;
    }

    if (brightness < 105 && ["Two-piece suit", "Jumpsuit", "Native set"].includes(candidate.name)) {
      score += 4;
    }

    if (brightness >= 105 && brightness <= 185 && ["Kaftan", "Long sleeve shirt", "A-line dress"].includes(candidate.name)) {
      score += 3;
    }
  }

  if (spread > 55 && ["A-line dress", "Blouse and skirt", "Evening gown"].includes(candidate.name)) {
    score += 3;
  }

  return score;
}

function getBodyFitScore(candidate, measurements) {
  let score = 0;
  const frame = measurements.chest + measurements.waist + measurements.hip;
  const lengthProfile = measurements.length;

  if (frame > 112 && candidate.complexity <= 1.22) {
    score += 4;
  }

  if (frame < 100 && candidate.complexity >= 1.55) {
    score += 3;
  }

  if (lengthProfile > 48 && ["Evening gown", "Kaftan", "Native set"].includes(candidate.name)) {
    score += 4;
  }

  if (measurements.shoulder >= 18 && ["Two-piece suit", "Long sleeve shirt", "Native set"].includes(candidate.name)) {
    score += 3;
  }

  return score;
}

function getStyleReferenceScore(candidate, styleInsight) {
  if (!styleInsight) {
    return 0;
  }

  let score = 0;
  const rank = styleInsight.preferredStyles.indexOf(candidate.name);

  if (rank === 0) {
    score += 14;
  } else if (rank === 1) {
    score += 10;
  } else if (rank === 2) {
    score += 6;
  }

  if (styleInsight.silhouette === "elongated" && ["Evening gown", "Kaftan", "Native set"].includes(candidate.name)) {
    score += 5;
  }

  if (styleInsight.silhouette === "tailored" && ["Two-piece suit", "Jumpsuit", "Long sleeve shirt"].includes(candidate.name)) {
    score += 5;
  }

  if (styleInsight.silhouette === "draped" && ["Evening gown", "Blouse and skirt", "A-line dress"].includes(candidate.name)) {
    score += 5;
  }

  return score;
}

function buildStyleRecommendations({
  styles,
  selectedStyleName,
  gender,
  fabricType,
  pattern,
  texture,
  measurements,
  collectionMode,
  fabricPrice,
  hasFabricImage,
  availableYardage,
  imageSignal,
  styleInsight,
}) {
  const selectedTemplate = styles.find((item) => item.name === selectedStyleName) || styles[0];

  return styles
    .map((candidate) => {
      const summary = calculateSummary({
        gender,
        style: candidate,
        fabricType,
        pattern,
        texture,
        measurements,
        collectionMode,
        fabricPrice,
        hasFabricImage,
        styleInsight,
      });

      const templateDelta = Math.abs(candidate.complexity - selectedTemplate.complexity);
      const availableGap = availableYardage > 0 ? Number((availableYardage - summary.yardage).toFixed(1)) : null;
      const worksWithAvailableFabric = availableGap === null ? true : availableGap >= 0;
      const complexityPenalty = ["Chiffon", "Lace"].includes(fabricType) && candidate.complexity > 1.45 ? 7 : 0;
      const patternPenalty = pattern === "Floral" && candidate.complexity > 1.55 ? 5 : 0;
      const templateAlignment = getTemplateAlignmentScore(candidate, selectedTemplate);
      const materialSignalScore = getFabricSignalScore(candidate, fabricType, texture, pattern, imageSignal);
      const bodyFitScore = getBodyFitScore(candidate, measurements);
      const styleReferenceScore = getStyleReferenceScore(candidate, styleInsight);
      const feasibilityAdjustment = worksWithAvailableFabric ? 8 : -14;
      const score = clampValue(
        Math.round(summary.confidence + templateAlignment + materialSignalScore + bodyFitScore + styleReferenceScore - templateDelta * 6 - complexityPenalty - patternPenalty + feasibilityAdjustment),
        52,
        99
      );

      return {
        ...candidate,
        summary,
        score,
        availableGap,
        worksWithAvailableFabric,
        scoreBreakdown: {
          base: summary.confidence,
          template: Math.round(templateAlignment),
          material: Math.round(materialSignalScore),
          body: Math.round(bodyFitScore),
          styleCue: Math.round(styleReferenceScore),
          feasibility: feasibilityAdjustment,
        },
        note: getStyleCompatibilityNote(candidate, fabricType, texture, pattern, availableYardage, summary.yardage),
      };
    })
    .sort((left, right) => {
      if (left.worksWithAvailableFabric !== right.worksWithAvailableFabric) {
        return left.worksWithAvailableFabric ? -1 : 1;
      }

      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.summary.yardage - right.summary.yardage;
    });
}

function getValidationState(measurements, fabricPrice, fabricPreview, stylePreview) {
  const issues = [];
  let completed = 0;
  const totalChecks = measurementConfig.length + 4;

  measurementConfig.forEach((field) => {
    const rawValue = Number.parseFloat(measurements[field.key]);
    if (!Number.isFinite(rawValue)) {
      issues.push(`${field.label} is missing.`);
      return;
    }

    if (rawValue < field.min || rawValue > field.max) {
      issues.push(`${field.label} should stay between ${field.min} and ${field.max} inches.`);
      return;
    }

    completed += 1;
  });

  const parsedPrice = Number.parseFloat(fabricPrice);
  if (Number.isFinite(parsedPrice) && parsedPrice > 0) {
    completed += 1;
  } else {
    issues.push("Fabric price must be greater than zero.");
  }

  if (Number.isFinite(Number.parseFloat(measurements.availableYardage)) && Number.parseFloat(measurements.availableYardage) > 0) {
    completed += 1;
  } else {
    issues.push("Available material quantity should be greater than zero.");
  }

  if (fabricPreview) {
    completed += 1;
  } else {
    issues.push("Adding a fabric image improves the recommendation quality.");
  }

  if (stylePreview) {
    completed += 1;
  } else {
    issues.push("A style reference helps the atelier align finishing details.");
  }

  return {
    score: Math.round((completed / totalChecks) * 100),
    issues,
  };
}

function getRecommendation(style, fabricType, texture, pattern, confidence) {
  const note =
    style.name === "Evening gown"
      ? "Bias-cut drape and lining checks are recommended before final cutting."
      : style.name === "Two-piece suit"
        ? "Add a fitting checkpoint after canvas shaping and sleeve balancing."
        : pattern === "Floral"
          ? "Plan mirrored placement around the front panel before cutting." 
          : "Current combination is suitable for direct sampling with standard ease allowances.";

  const fitSignal = confidence >= 90 ? "Strong match" : confidence >= 82 ? "Viable with one fitting" : "Needs atelier review";
  return `${fitSignal}. ${fabricType} with a ${texture.toLowerCase()} hand works well for ${style.name.toLowerCase()}. ${note}`;
}

export default function App() {
  const [selectedColor, setSelectedColor] = useState(colors[4]);
  const [fabricType, setFabricType] = useState("Cotton");
  const [texture, setTexture] = useState("Smooth");
  const [pattern, setPattern] = useState("Plain");
  const [gender, setGender] = useState("Female");
  const [selectedStyle, setSelectedStyle] = useState(styleTemplates.Female[0].name);
  const [collectionMode, setCollectionMode] = useState("Pickup");
  const [fabricPrice, setFabricPrice] = useState("3500");
  const [availableYardage, setAvailableYardage] = useState("6");
  const [measurements, setMeasurements] = useState(initialMeasurements);
  const [fabricPreview, setFabricPreview] = useState("");
  const [stylePreview, setStylePreview] = useState("");
  const [imageSignal, setImageSignal] = useState(null);
  const [styleImageSignal, setStyleImageSignal] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Upload a fabric image to improve texture detection and cost reliability.");
  const [uploadError, setUploadError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fabricInputRef = useRef(null);
  const styleInputRef = useRef(null);

  const availableStyles = styleTemplates[gender];
  const style = availableStyles.find((item) => item.name === selectedStyle) || availableStyles[0];
  const safeMeasurements = useMemo(() => sanitizeMeasurements(measurements), [measurements]);
  const parsedFabricPrice = useMemo(() => {
    const value = Number.parseFloat(fabricPrice);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }, [fabricPrice]);
  const parsedAvailableYardage = useMemo(() => {
    const value = Number.parseFloat(availableYardage);
    return Number.isFinite(value) && value > 0 ? value : 0;
  }, [availableYardage]);
  const inferredFabric = useMemo(() => (imageSignal ? inferFabricType(imageSignal) : null), [imageSignal]);
  const styleInsight = useMemo(() => (styleImageSignal ? inferStyleProfile(styleImageSignal, gender) : null), [styleImageSignal, gender]);

  const styleRecommendations = useMemo(
    () =>
      buildStyleRecommendations({
        styles: availableStyles,
        selectedStyleName: selectedStyle,
        gender,
        fabricType,
        pattern,
        texture,
        measurements: safeMeasurements,
        collectionMode,
        fabricPrice: parsedFabricPrice,
        hasFabricImage: Boolean(fabricPreview),
        availableYardage: parsedAvailableYardage,
        imageSignal,
        styleInsight,
      }),
    [availableStyles, selectedStyle, gender, fabricType, pattern, texture, safeMeasurements, collectionMode, parsedFabricPrice, fabricPreview, parsedAvailableYardage, imageSignal, styleInsight]
  );
  const selectedRecommendation = styleRecommendations.find((item) => item.name === selectedStyle) || styleRecommendations[0];
  const activeStyle = selectedRecommendation || style;
  const summary = selectedRecommendation?.summary ||
    calculateSummary({
      style,
      fabricType,
      pattern,
      texture,
      measurements: safeMeasurements,
      collectionMode,
      fabricPrice: parsedFabricPrice,
      hasFabricImage: Boolean(fabricPreview),
      styleInsight,
    });
  const viableAlternatives = styleRecommendations.filter((item) => item.name !== selectedStyle && item.worksWithAvailableFabric).slice(0, 3);
  const topGeneratedStyles = styleInsight
    ? styleRecommendations.filter((item) => item.name === selectedStyle).slice(0, 1)
    : styleRecommendations.slice(0, 4);

  const validation = useMemo(
    () => getValidationState({ ...measurements, availableYardage }, fabricPrice, fabricPreview, stylePreview),
    [measurements, availableYardage, fabricPrice, fabricPreview, stylePreview]
  );
  const recommendation = useMemo(
    () => getRecommendation(activeStyle, fabricType, imageSignal?.texture || texture, pattern, summary.confidence),
    [activeStyle, fabricType, imageSignal, texture, pattern, summary.confidence]
  );

  async function handleImageUpload(kind, file) {
    try {
      validateUpload(file);
      setUploadError("");
      setStatusMessage(kind === "fabric" ? "Analyzing uploaded fabric image for texture and tonal balance..." : "Style reference uploaded. The preview board has been refreshed.");

      const src = await readImage(file);
      if (typeof src !== "string") {
        throw new Error("The selected image could not be prepared.");
      }

      if (kind === "fabric") {
        setIsAnalyzing(true);
        setFabricPreview(src);
        const signal = await analyzeFabricImage(src);
        const inferred = inferFabricType(signal);
        setImageSignal(signal);
        setTexture(signal.texture);
        setFabricType(inferred.type);
        setStatusMessage(`Fabric scan complete. Detected ${inferred.type.toLowerCase()} with ${inferred.confidence}% reliability and auto-applied it. You can override the fabric type manually.`);
      } else {
        setStylePreview(src);
        const signal = await analyzeStyleImage(src);
        const inferred = inferStyleProfile(signal, gender);
        setStyleImageSignal(signal);
        const preferredStyle = inferred.preferredStyles[0];
        if (preferredStyle) {
          setSelectedStyle(preferredStyle);
        }
        setStatusMessage(`Style reference uploaded. ${preferredStyle || "The closest style"} is now prioritized from a ${inferred.silhouette} silhouette cue with ${inferred.confidence}% reliability.`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "The upload could not be completed.";
      setUploadError(message);
      setStatusMessage("Upload failed. Please replace the image and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function updateMeasurement(name, rawValue) {
    if (rawValue === "") {
      setMeasurements((current) => ({ ...current, [name]: "" }));
      return;
    }

    if (!/^\d*\.?\d*$/.test(rawValue)) {
      return;
    }

    setMeasurements((current) => ({
      ...current,
      [name]: rawValue,
    }));
  }

  function handleGenderChange(nextGender) {
    setGender(nextGender);
    setSelectedStyle(styleTemplates[nextGender][0].name);
  }

  function handlePriceChange(rawValue) {
    if (rawValue === "" || /^\d*\.?\d*$/.test(rawValue)) {
      setFabricPrice(rawValue);
    }
  }

  function handleAvailableYardageChange(rawValue) {
    if (rawValue === "" || /^\d*\.?\d*$/.test(rawValue)) {
      setAvailableYardage(rawValue);
    }
  }

  function handleReliabilityBadgeClick() {
    const summarySection = document.getElementById("summary");
    summarySection?.scrollIntoView({ behavior: "smooth", block: "start" });
    setStatusMessage(
      `Reliability score is rule-based (not ML probability). Current estimate: ${summary.confidence}%.`
    );
  }

  return (
    <main className="app-shell min-h-screen text-stone-900">
      <div className="ambient-grid" aria-hidden="true" />
      <header className="sticky top-0 z-30 border-b border-white/40 bg-[rgba(244,239,231,0.82)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8 lg:px-10">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.5em] text-stone-500">Fabrica</div>
            <p className="mt-1 text-sm text-stone-600">Atelier recommendation console</p>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-stone-600 md:flex">
            <a href="#overview" className="transition hover:text-stone-950">Overview</a>
            <a href="#atelier-console" className="transition hover:text-stone-950">Atelier Console</a>
            <a href="#measurements" className="transition hover:text-stone-950">Measurements</a>
            <a href="#summary" className="transition hover:text-stone-950">Summary</a>
          </nav>
          <button
            type="button"
            onClick={handleReliabilityBadgeClick}
            className="flex items-center gap-3 rounded-full border border-stone-300/80 bg-white/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-600 transition hover:border-stone-500 hover:text-stone-900"
            title="Show reliability score details"
            aria-label="Show reliability score details"
          >
            <ShieldCheck size={16} />
            {isAnalyzing ? "Analyzing" : `${summary.confidence}% reliability`}
          </button>
        </div>
      </header>

      <section id="overview" className="mx-auto grid max-w-7xl gap-10 px-5 pb-12 pt-8 md:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:pt-12">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(28,52,41,0.15)] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#1c3429] shadow-[0_20px_50px_rgba(40,29,18,0.08)]">
            <WandSparkles size={14} />
            Production-ready tailoring simulation
          </div>
          <h1 className="mt-6 max-w-3xl [font-family:var(--font-display)] text-5xl leading-none text-stone-950 md:text-7xl">
            Win client confidence before the fabric ever reaches the cutting table.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600 md:text-xl">
            Fabrica turns a rough tailoring conversation into a polished order brief with guided uploads, fit-aware inputs, and a summary that feels ready for premium studio operations.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#atelier-console"
              className="inline-flex items-center gap-2 rounded-full bg-[#1c3429] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#11241d]"
            >
              Start an order brief
              <ArrowRight size={16} />
            </a>
            <a
              href="#summary"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/75 px-6 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-500"
            >
              Review estimate output
            </a>
          </div>

          <p className="mt-4 text-sm leading-7 text-stone-500">
            Built for tailoring studios, fashion houses, and bespoke teams that need a more convincing way to discuss fabric choice, pricing, and turnaround.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <ActionPill icon={<ShieldCheck size={16} />} label="Validated measurements" />
            <ActionPill icon={<SwatchBook size={16} />} label="Fabric-aware preview" />
            <ActionPill icon={<Clock3 size={16} />} label="Lead-time projection" />
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {statHighlights.map((stat) => (
              <article key={stat.label} className="panel-surface rounded-[28px] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">{stat.label}</p>
                <p className="mt-3 text-sm leading-6 text-stone-700">{stat.value}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {conversionStats.map((item) => (
              <div key={item.label} className="rounded-[24px] border border-white/55 bg-white/55 px-5 py-4 shadow-[0_18px_45px_rgba(40,29,18,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-stone-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="hero-stage rounded-[32px] p-4 sm:p-6">
          <div className="rounded-[28px] border border-white/50 bg-[rgba(20,29,33,0.92)] p-4 text-stone-50 shadow-[0_40px_120px_rgba(17,12,9,0.28)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">Live composition</p>
                <h2 className="mt-2 [font-family:var(--font-display)] text-3xl">{activeStyle.name}</h2>
              </div>
              <div className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-stone-200">
                {selectedColor.name} / {fabricType} / {summary.yardage.toFixed(1)} required yards
              </div>
            </div>

            <div className="fabric-stage mt-6 overflow-hidden rounded-[24px] p-5 sm:p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_45%)]" aria-hidden="true" />
              <div
                className={`fabric-grain ${patternClasses[pattern]} absolute inset-[12px] rounded-[20px] border border-white/15`}
                style={{ backgroundColor: selectedColor.value }}
              >
                {fabricPreview ? (
                  <img src={fabricPreview} alt="Uploaded fabric preview" className="absolute inset-0 h-full w-full object-cover mix-blend-multiply opacity-70" />
                ) : null}
              </div>
              <GarmentPreview
                fabricPreview={fabricPreview}
                gender={gender}
                pattern={pattern}
                selectedColor={selectedColor}
                styleName={activeStyle.name}
                stylePreview={stylePreview}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <PreviewBadge label="Style" value={activeStyle.name} />
              <PreviewBadge label="Required yardage" value={`${summary.yardage.toFixed(1)} yards`} />
              <PreviewBadge label="Recommended texture" value={imageSignal?.texture || texture} />
              <PreviewBadge label="Turnaround" value={`${summary.completionDays} days`} />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <InsightCard title="Silhouette note" value={activeStyle.silhouette} icon={<BadgeCheck size={17} />} />
              <InsightCard title="Atelier signal" value={recommendation} icon={<Sparkles size={17} />} />
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-300">Fit status</p>
                  <p className="mt-2 text-sm text-stone-100">
                    {selectedRecommendation?.worksWithAvailableFabric
                      ? `${selectedStyle} fits within the available cloth and remains one of the strongest generated options.`
                      : `${selectedStyle} exceeds the cloth on hand. Fabrica is surfacing better-fitting alternatives below.`}
                  </p>
                </div>
                <div className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${selectedRecommendation?.worksWithAvailableFabric ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"}`}>
                  {selectedRecommendation?.worksWithAvailableFabric ? "Cuttable" : "Short by material"}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <InsightCard
                title="Detected fabric"
                value={inferredFabric ? `${inferredFabric.type} at ${inferredFabric.confidence}% confidence. Alternatives: ${inferredFabric.alternatives.join(", ")}.` : "Upload fabric to infer the most likely fabric family automatically."}
                icon={<SwatchBook size={17} />}
              />
              <InsightCard
                title="Style reference cue"
                value={styleInsight ? `${selectedStyle} is prioritized from the uploaded ${styleInsight.silhouette} silhouette. Manual template changes still override it.` : "Upload a style reference to identify and prioritize the closest matching style template."}
                icon={<Camera size={17} />}
              />
            </div>
          </div>
        </section>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-16 md:px-8 lg:grid-cols-[1fr_380px] lg:px-10">
        <div className="space-y-8">
          <section className="panel-surface rounded-[32px] p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">Workflow</p>
                <h2 className="mt-3 [font-family:var(--font-display)] text-4xl text-stone-950">A clearer path from inspiration to quotation</h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-stone-600">
                The interface is structured to reduce guesswork at the exact moments where bespoke orders usually become vague: fabric interpretation, fit alignment, and pricing explanation.
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {workflowSteps.map((item) => (
                <article key={item.step} className="rounded-[28px] border border-white/60 bg-white/65 p-5 shadow-[0_18px_45px_rgba(40,29,18,0.05)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c3429]">Step {item.step}</p>
                  <h3 className="mt-3 text-xl font-semibold text-stone-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{item.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="atelier-console" className="panel-surface rounded-[32px] p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">Atelier console</p>
                <h2 className="mt-3 [font-family:var(--font-display)] text-4xl text-stone-950">Configure the order brief</h2>
              </div>
              <div className="rounded-[22px] border border-stone-300/70 bg-white/70 px-4 py-3 text-sm text-stone-600">
                Studio-ready configuration with guarded uploads, constrained numeric inputs, and generated style suggestions.
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <UploadButton
                label="Fabric image"
                detail={fabricPreview ? "Uploaded and analyzed" : "JPEG, PNG, WEBP up to 6 MB"}
                icon={<Upload size={18} />}
                onClick={() => fabricInputRef.current?.click()}
              />
              <UploadButton
                label="Style reference"
                detail={stylePreview ? `${selectedStyle} prioritized` : "Image of the preferred style"}
                icon={<Camera size={18} />}
                onClick={() => styleInputRef.current?.click()}
              />
            </div>

            <input
              ref={fabricInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleImageUpload("fabric", file);
                }
                event.target.value = "";
              }}
            />
            <input
              ref={styleInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleImageUpload("style", file);
                }
                event.target.value = "";
              }}
            />

            <div className={`mt-5 rounded-[22px] border px-4 py-4 text-sm ${uploadError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-stone-200 bg-stone-50/80 text-stone-600"}`}>
              <div className="flex items-start gap-3">
                {uploadError ? <AlertCircle size={18} className="mt-0.5 shrink-0" /> : <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#1c3429]" />}
                <div>
                  <p>{uploadError || statusMessage}</p>
                  {!uploadError && (inferredFabric || styleInsight) ? (
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-stone-500">
                      {inferredFabric ? `Detected fabric: ${inferredFabric.type}` : "Awaiting fabric inference"}
                      {styleInsight ? ` / Style cue: ${styleInsight.silhouette}` : " / Awaiting style cue"}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <OptionGroup label="Client profile" options={genders} value={gender} onChange={handleGenderChange} icon={<UserRound size={17} />} columns="grid-cols-2" />
              <OptionGroup label="Style template" options={availableStyles.map((item) => item.name)} value={style.name} onChange={setSelectedStyle} icon={<FileText size={17} />} columns="grid-cols-1" />
              <OptionGroup label="Fabric type" options={fabricTypes} value={fabricType} onChange={setFabricType} icon={<Shirt size={17} />} columns="grid-cols-2" />
              <OptionGroup label="Texture" options={textures} value={texture} onChange={setTexture} icon={<Layers size={17} />} columns="grid-cols-2" />
              <OptionGroup label="Pattern" options={patterns} value={pattern} onChange={setPattern} icon={<Camera size={17} />} columns="grid-cols-2" />
              <OptionGroup label="Collection mode" options={collectionModes} value={collectionMode} onChange={setCollectionMode} icon={<Truck size={17} />} columns="grid-cols-2" />
            </div>
          </section>

          <section className="panel-surface rounded-[32px] p-6 md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">Generated styles</p>
                <h2 className="mt-3 [font-family:var(--font-display)] text-4xl text-stone-950">{styleInsight ? "Prioritized uploaded style" : "Auto-recommended options from the uploaded fabric"}</h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-stone-600">
                {styleInsight
                  ? "The uploaded style reference is treated as the primary style direction. Yardage is calculated from that style and the client measurements."
                  : "Fabrica derives yardage for each style under the selected gender, compares that against the cloth you have on hand, and ranks the strongest options."}
              </p>
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-2">
              {topGeneratedStyles.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSelectedStyle(item.name)}
                  className={`rounded-[28px] border p-5 text-left shadow-[0_18px_45px_rgba(40,29,18,0.05)] transition hover:-translate-y-0.5 ${item.name === selectedStyle ? "border-[#1c3429] bg-[#1c3429] text-white" : "border-white/60 bg-white/70 text-stone-900"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${item.name === selectedStyle ? "text-stone-300" : "text-stone-500"}`}>
                        Generated match score {item.score}%
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold">{item.name}</h3>
                    </div>
                    <div className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${item.worksWithAvailableFabric ? (item.name === selectedStyle ? "bg-emerald-100 text-emerald-900" : "bg-emerald-50 text-emerald-700") : (item.name === selectedStyle ? "bg-amber-100 text-amber-900" : "bg-amber-50 text-amber-700")}`}>
                      {item.worksWithAvailableFabric ? "Works with cloth" : "Needs more cloth"}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <MetricCard label="Required yards" value={`${item.summary.yardage.toFixed(1)} yards`} icon={<Ruler size={15} />} tone={item.name === selectedStyle ? "dark" : "light"} />
                    <MetricCard label="Completion" value={`${item.summary.completionDays} days`} icon={<CalendarDays size={15} />} tone={item.name === selectedStyle ? "dark" : "light"} />
                  </div>

                  <p className={`mt-4 text-sm leading-6 ${item.name === selectedStyle ? "text-stone-200" : "text-stone-600"}`}>{item.note}</p>
                  <p className={`mt-3 text-xs uppercase tracking-[0.16em] ${item.name === selectedStyle ? "text-stone-300" : "text-stone-500"}`}>
                    score mix: t{item.scoreBreakdown.template} m{item.scoreBreakdown.material} b{item.scoreBreakdown.body} s{item.scoreBreakdown.styleCue}
                  </p>
                  {styleInsight?.preferredStyles.includes(item.name) ? (
                    <p className={`mt-3 text-xs font-semibold uppercase tracking-[0.18em] ${item.name === selectedStyle ? "text-stone-300" : "text-[#1c3429]"}`}>
                      Matched to uploaded style reference
                    </p>
                  ) : null}
                </button>
              ))}
            </div>
          </section>

          <section id="measurements" className="panel-surface rounded-[32px] p-6 md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-500">Fit inputs</p>
                <h2 className="mt-3 [font-family:var(--font-display)] text-4xl text-stone-950">Measurements with range guards</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-stone-300/80 bg-white/75 px-4 py-2 text-sm text-stone-600">
                <Ruler size={16} />
                Body values in inches
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {measurementConfig.map((field) => {
                const rawValue = measurements[field.key];
                const parsed = Number.parseFloat(rawValue);
                const invalid = rawValue === "" || !Number.isFinite(parsed) || parsed < field.min || parsed > field.max;

                return (
                  <label key={field.key} className={`field-shell rounded-[24px] p-4 ${invalid ? "border-rose-200" : "border-white/60"}`}>
                    <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">{field.label}</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={rawValue}
                      aria-invalid={invalid}
                      aria-describedby={`${field.key}-hint`}
                      onChange={(event) => updateMeasurement(field.key, event.target.value)}
                      className="mt-3 w-full border-0 bg-transparent text-3xl font-semibold tracking-tight text-stone-950 outline-none"
                    />
                    <span id={`${field.key}-hint`} className="mt-3 block text-sm text-stone-500">
                      Range {field.min} to {field.max}
                    </span>
                  </label>
                );
              })}
            </div>

            <label className="field-shell mt-4 block rounded-[24px] p-4">
              <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Fabric price per yard</span>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xl font-semibold text-stone-500">NGN</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={fabricPrice}
                  aria-invalid={parsedFabricPrice === 0}
                  onChange={(event) => handlePriceChange(event.target.value)}
                  className="w-full border-0 bg-transparent text-3xl font-semibold tracking-tight text-stone-950 outline-none"
                />
              </div>
            </label>

            <label className="field-shell mt-4 block rounded-[24px] p-4">
              <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Available material quantity</span>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xl font-semibold text-stone-500">YDS</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={availableYardage}
                  aria-invalid={parsedAvailableYardage === 0}
                  onChange={(event) => handleAvailableYardageChange(event.target.value)}
                  className="w-full border-0 bg-transparent text-3xl font-semibold tracking-tight text-stone-950 outline-none"
                />
              </div>
              <span className="mt-3 block text-sm text-stone-500">Used to filter styles that can be cut from the cloth already available.</span>
            </label>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:h-fit">
          <section id="summary" className="panel-surface rounded-[32px] p-6 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">Summary</p>
                <h2 className="mt-3 [font-family:var(--font-display)] text-3xl text-stone-950">Order intelligence</h2>
              </div>
              <div className="rounded-full bg-[#1c3429] px-4 py-2 text-sm font-semibold text-white">{validation.score}% ready</div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-stone-200">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,#1c3429,#b2874e)]" style={{ width: `${validation.score}%` }} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-stone-700">
              <Metric label="Required yardage" value={`${summary.yardage.toFixed(1)} yards`} />
              <Metric label="Available cloth" value={parsedAvailableYardage > 0 ? `${parsedAvailableYardage.toFixed(1)} yards` : "Add quantity"} icon={<Ruler size={16} />} />
              <Metric label="Completion" value={`${summary.completionDays} days`} icon={<CalendarDays size={16} />} />
              <Metric label="Texture" value={imageSignal?.texture || texture} />
              <Metric label="Detected fabric" value={inferredFabric?.type || fabricType} />
            </div>

            <div className="mt-6 rounded-[24px] border border-stone-200 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Recommendation note</p>
              <p className="mt-3 text-sm leading-6 text-stone-700">{recommendation}</p>
            </div>

            <div className={`mt-6 rounded-[24px] border p-4 ${selectedRecommendation?.worksWithAvailableFabric ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
              <div className="flex items-start gap-3">
                {selectedRecommendation?.worksWithAvailableFabric ? <CheckCheck size={18} className="mt-0.5 shrink-0 text-emerald-700" /> : <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-700" />}
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${selectedRecommendation?.worksWithAvailableFabric ? "text-emerald-800" : "text-amber-800"}`}>
                    Fabric availability check
                  </p>
                  <p className={`mt-2 text-sm leading-6 ${selectedRecommendation?.worksWithAvailableFabric ? "text-emerald-900" : "text-amber-900"}`}>
                    {selectedRecommendation?.worksWithAvailableFabric
                      ? `${selectedStyle} can be cut from the available ${parsedAvailableYardage.toFixed(1)} yards with ${selectedRecommendation.availableGap?.toFixed(1) || "0.0"} yards remaining.`
                      : `${selectedStyle} needs ${summary.yardage.toFixed(1)} yards, so Fabrica recommends switching to one of the alternatives below.`}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-stone-200 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">Alternative styles for available material</p>
              <div className="mt-4 space-y-3">
                {styleInsight ? (
                  <p className="text-sm leading-6 text-stone-600">Style reference mode is active, so alternatives are hidden until you manually choose another template or replace the reference.</p>
                ) : viableAlternatives.length > 0 ? (
                  viableAlternatives.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setSelectedStyle(item.name)}
                      className="flex w-full items-center justify-between gap-4 rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-left transition hover:border-stone-400"
                    >
                      <div>
                        <p className="font-semibold text-stone-900">{item.name}</p>
                        <p className="mt-1 text-sm text-stone-600">{item.summary.yardage.toFixed(1)} yards needed · {item.availableGap?.toFixed(1)} yards spare</p>
                      </div>
                      <span className="rounded-full bg-stone-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-700">Use this style</span>
                    </button>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-stone-600">No lower-yardage alternatives are currently available under this gender profile. Increase available material or revise the client profile.</p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-stone-200 pt-5 text-sm">
              <SummaryRow label="Material estimate" value={formatMoney.format(summary.materialEstimate)} />
              <SummaryRow label="Tailoring labor" value={formatMoney.format(summary.labor)} />
              <SummaryRow label="Pressing and finishing" value={formatMoney.format(summary.pressingFee)} />
              <SummaryRow label="Collection fee" value={formatMoney.format(summary.deliveryFee)} />
              <SummaryRow label="Estimated total" value={formatMoney.format(summary.total)} strong />
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[20px] bg-[#1c3429] px-4 py-4 text-sm font-semibold text-white transition hover:bg-[#11241d]"
            >
              <Printer size={17} />
              Print summary
            </button>
          </section>

          <section className="panel-surface rounded-[32px] p-6 md:p-7">
            <div className="flex items-center gap-3">
              <Check size={18} className="text-[#1c3429]" />
              <h3 className="text-lg font-semibold text-stone-950">Production review</h3>
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-stone-700">
              {validation.issues.slice(0, 3).map((issue) => (
                <li key={issue} className="rounded-[18px] border border-stone-200 bg-white/75 px-4 py-3">{issue}</li>
              ))}
              {validation.issues.length === 0 ? (
                <li className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
                  All primary inputs are within range. The brief is ready for client-facing review.
                </li>
              ) : null}
            </ul>
          </section>

          <section className="rounded-[32px] border border-stone-300/80 bg-[linear-gradient(180deg,rgba(28,52,41,0.97),rgba(20,29,33,0.98))] p-6 text-white shadow-[0_32px_90px_rgba(16,20,24,0.26)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-stone-300">Studio handoff</p>
            <h3 className="mt-3 [font-family:var(--font-display)] text-3xl">Move from rough consultation to a more premium handoff.</h3>
            <p className="mt-4 text-sm leading-7 text-stone-300">
              The revised copy now positions Fabrica as a client-ready studio tool: stronger value framing up front, clearer workflow messaging in the middle, and a more confident call to action at the end.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white">
              Premium consultation flow
              <ArrowRight size={16} />
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function GarmentPreview({ fabricPreview, gender, pattern, selectedColor, styleName, stylePreview }) {
  const garmentPieceStyle = {
    backgroundColor: selectedColor.value,
    backgroundImage: fabricPreview ? `url(${fabricPreview})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      {stylePreview ? (
        <img src={stylePreview} alt="Uploaded style reference" className="absolute inset-[12px] h-[calc(100%-24px)] w-[calc(100%-24px)] rounded-[20px] object-cover opacity-20 mix-blend-screen" />
      ) : null}
      <div className={`relative h-[70%] w-[40%] min-w-[220px] max-w-[280px] ${patternClasses[pattern]}`}>
        <div className="absolute left-1/2 top-0 h-[15%] w-[19%] -translate-x-1/2 rounded-full border border-white/30 bg-white/15 backdrop-blur-sm" />
        <div
          className={`absolute left-1/2 top-[13%] h-[56%] -translate-x-1/2 border border-white/45 bg-blend-multiply shadow-[inset_0_32px_70px_rgba(255,255,255,0.24),0_18px_50px_rgba(0,0,0,0.16)] ${
            styleName === "Two-piece suit"
              ? "w-[52%] rounded-t-[18px]"
              : styleName === "Jumpsuit"
                ? "w-[50%] rounded-t-[34%]"
                : "w-[46%] rounded-t-[42%]"
          }`}
          style={garmentPieceStyle}
        />
        <div
          className="absolute left-[11%] top-[20%] h-[35%] w-[24%] -rotate-[13deg] rounded-full border border-white/35 bg-blend-multiply"
          style={garmentPieceStyle}
        />
        <div
          className="absolute right-[11%] top-[20%] h-[35%] w-[24%] rotate-[13deg] rounded-full border border-white/35 bg-blend-multiply"
          style={garmentPieceStyle}
        />
        <div
          className={`absolute bottom-[5%] left-1/2 h-[31%] -translate-x-1/2 border border-white/35 bg-blend-multiply ${
            gender === "Female" ? "w-[66%] rounded-b-[46%]" : "w-[48%] rounded-b-[18px]"
          } ${styleName === "Evening gown" ? "h-[42%] w-[78%] rounded-b-[50%]" : ""} ${styleName === "Long sleeve shirt" ? "h-[22%] w-[42%] rounded-b-[12px]" : ""}`}
          style={garmentPieceStyle}
        />
        {fabricPreview ? (
          <div className="absolute bottom-[-12%] left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur-sm">
            Live fabric composite
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ActionPill({ icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-stone-300/80 bg-white/70 px-4 py-2 text-sm text-stone-700 shadow-[0_18px_45px_rgba(40,29,18,0.07)]">
      <span className="text-[#1c3429]">{icon}</span>
      {label}
    </div>
  );
}

function PreviewBadge({ label, value }) {
  return (
    <div className="rounded-full border border-white/15 bg-black/35 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
      <span className="text-white/60">{label}</span>
      <span className="ml-2 font-semibold text-white">{value}</span>
    </div>
  );
}

function InsightCard({ title, value, icon }) {
  return (
    <article className="rounded-[22px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-300">
        {icon}
        {title}
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-100">{value}</p>
    </article>
  );
}

function UploadButton({ label, detail, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center justify-between rounded-[24px] border border-stone-200 bg-white/75 px-5 py-5 text-left shadow-[0_20px_45px_rgba(40,29,18,0.05)] transition hover:-translate-y-0.5 hover:border-stone-400"
    >
      <span className="flex min-w-0 items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-700">{icon}</span>
        <span className="min-w-0">
          <span className="block truncate text-base font-semibold text-stone-900">{label}</span>
          <span className="mt-1 block text-sm text-stone-500">{detail}</span>
        </span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-stone-400 transition group-hover:text-stone-900" />
    </button>
  );
}

function OptionGroup({ label, options, value, onChange, icon, columns }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-600">
        {icon}
        <span>{label}</span>
      </div>
      <div className={`grid gap-2 ${columns}`}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={value === option}
            className={`rounded-[18px] border px-4 py-3 text-left text-sm font-semibold transition ${
              value === option
                ? "border-[#1c3429] bg-[#1c3429] text-white shadow-[0_18px_40px_rgba(28,52,41,0.2)]"
                : "border-stone-200 bg-white/80 text-stone-700 hover:border-stone-400"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, icon }) {
  return <MetricCard label={label} value={value} icon={icon} tone="light" />;
}

function MetricCard({ label, value, icon, tone = "light" }) {
  return (
    <div className={`rounded-[20px] border p-4 shadow-[0_18px_45px_rgba(40,29,18,0.04)] ${tone === "dark" ? "border-white/10 bg-white/5" : "border-stone-200 bg-white/85"}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${tone === "dark" ? "text-stone-300" : "text-stone-500"}`}>{label}</p>
      <div className={`mt-3 flex items-center gap-2 text-base font-semibold ${tone === "dark" ? "text-white" : "text-stone-900"}`}>
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? "text-base font-semibold text-stone-950" : "text-stone-600"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
