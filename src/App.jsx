import { useMemo, useRef, useState } from "react";
import {
  Camera,
  Check,
  ChevronRight,
  Layers,
  ScanLine,
  Shirt,
  Sparkles,
  Upload,
} from "lucide-react";

const colors = [
  { name: "Ivory", value: "#f5f1e8", tone: "light" },
  { name: "Rose", value: "#d89aa5", tone: "warm" },
  { name: "Sage", value: "#8fa58a", tone: "cool" },
  { name: "Cobalt", value: "#153d78", tone: "cool" },
  { name: "Charcoal", value: "#2c2f35", tone: "dark" },
  { name: "Ruby", value: "#bd1519", tone: "warm" },
];

const fabricTypes = ["Silk", "Cotton", "Linen", "Denim", "Chiffon", "Wool"];
const textures = ["Smooth", "Crisp", "Soft", "Ribbed", "Sheer", "Structured"];
const patterns = ["Plain", "Stripes", "Check", "Floral"];
const occasions = ["Everyday", "Work", "Ceremony", "Evening"];

const styleRules = {
  Silk: ["Draped blouse", "Bias-cut dress", "Soft co-ord set"],
  Cotton: ["Relaxed shirt dress", "Boxy top", "Tailored two-piece"],
  Linen: ["Wide-leg set", "Wrap dress", "Minimal tunic"],
  Denim: ["Utility jacket", "Panel skirt", "Structured overshirt"],
  Chiffon: ["Layered dress", "Soft sleeve blouse", "Flowing skirt"],
  Wool: ["Clean blazer", "Longline coat", "Pleated trouser"],
};

const patternClasses = {
  Plain: "pattern-plain",
  Stripes: "pattern-stripes",
  Check: "pattern-check",
  Floral: "pattern-floral",
};

function getContrast(hex) {
  const color = hex.replace("#", "");
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#171a20" : "#ffffff";
}

function buildRecommendations({ fabricType, texture, pattern, occasion, selectedColor }) {
  const base = styleRules[fabricType] || styleRules.Cotton;
  const textureModifier = {
    Smooth: "clean finish",
    Crisp: "sharp collar",
    Soft: "relaxed drape",
    Ribbed: "fitted panel",
    Sheer: "layered lining",
    Structured: "defined silhouette",
  }[texture];

  return base.map((item, index) => ({
    title: item,
    match: Math.max(88 - index * 5 - (pattern === "Floral" ? 2 : 0), 76),
    detail: `${selectedColor.name} ${fabricType.toLowerCase()} with ${textureModifier} for ${occasion.toLowerCase()} styling.`,
    tags: [texture, pattern, occasion],
  }));
}

export default function App() {
  const [selectedColor, setSelectedColor] = useState(colors[4]);
  const [fabricType, setFabricType] = useState("Silk");
  const [texture, setTexture] = useState("Smooth");
  const [pattern, setPattern] = useState("Plain");
  const [occasion, setOccasion] = useState("Work");
  const [imagePreview, setImagePreview] = useState("");
  const [imageSignal, setImageSignal] = useState(null);
  const fileRef = useRef(null);

  const recommendations = useMemo(
    () => buildRecommendations({ fabricType, texture, pattern, occasion, selectedColor }),
    [fabricType, texture, pattern, occasion, selectedColor]
  );

  const confidence = useMemo(() => {
    const patternBoost = pattern === "Plain" ? 6 : 3;
    const imageBoost = imageSignal ? 8 : 0;
    return Math.min(82 + patternBoost + imageBoost, 98);
  }, [pattern, imageSignal]);

  function analyzeImage(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target.result;
      setImagePreview(src);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 48;
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, size, size);
        const { data } = context.getImageData(0, 0, size, size);
        let red = 0;
        let green = 0;
        let blue = 0;

        for (let i = 0; i < data.length; i += 4) {
          red += data[i];
          green += data[i + 1];
          blue += data[i + 2];
        }

        const pixels = data.length / 4;
        const avg = {
          r: Math.round(red / pixels),
          g: Math.round(green / pixels),
          b: Math.round(blue / pixels),
        };
        const brightness = Math.round((avg.r + avg.g + avg.b) / 3);
        const derivedTexture = brightness > 205 ? "Sheer" : brightness < 90 ? "Structured" : "Soft";

        setTexture(derivedTexture);
        setImageSignal({
          color: `rgb(${avg.r}, ${avg.g}, ${avg.b})`,
          brightness,
          texture: derivedTexture,
        });
      };
      image.src = src;
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="min-h-screen bg-white text-[#171a20]">
      <header className="fixed left-0 right-0 top-0 z-20 flex h-16 items-center justify-between bg-white/90 px-6 backdrop-blur md:px-10">
        <div className="tracking-[0.46em] text-sm font-semibold uppercase">Fabrica</div>
        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-500 md:flex">
          <a href="#capture">Capture</a>
          <a href="#analysis">Analysis</a>
          <a href="#recommendations">Recommendations</a>
        </nav>
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200" aria-label="Scan fabric">
          <ScanLine size={18} />
        </button>
      </header>

      <section className="grid min-h-screen grid-cols-1 pt-16 lg:grid-cols-[1fr_420px]">
        <div className="flex min-h-[620px] flex-col items-center justify-center px-6 py-10 lg:min-h-screen">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-neutral-400">Intelligent fabric-to-style system</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">Style from fabric attributes</h1>
          </div>

          <div className="relative w-full max-w-4xl">
            <div className="absolute left-1/2 top-8 h-80 w-80 -translate-x-1/2 rounded-full bg-neutral-100 blur-3xl" />
            <div
              className={`fabric-grain ${patternClasses[pattern]} relative mx-auto aspect-[16/9] w-full overflow-hidden rounded-[8px] shadow-soft`}
              style={{ backgroundColor: selectedColor.value }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Uploaded fabric preview" className="h-full w-full object-cover mix-blend-multiply opacity-75" />
              ) : null}
              <div className="absolute inset-x-[12%] bottom-[12%] h-[58%] rounded-t-[48%] border border-white/30 bg-white/10 shadow-[inset_0_30px_70px_rgba(255,255,255,0.26)]" />
              <div className="absolute left-[18%] top-[24%] h-[48%] w-[20%] -rotate-12 rounded-full bg-white/20 blur-xl" />
              <div className="absolute right-[16%] top-[20%] h-[52%] w-[18%] rotate-12 rounded-full bg-black/10 blur-xl" />
              <div className="absolute bottom-6 left-6 rounded bg-black/70 px-3 py-2 text-xs font-medium text-white">
                {fabricType} / {texture} / {pattern}
              </div>
            </div>
          </div>

          <div id="capture" className="mt-12 w-full max-w-3xl text-center">
            <p className="text-lg font-semibold text-neutral-500">Included</p>
            <h2 className="mt-2 text-3xl font-semibold">{selectedColor.name} {fabricType}</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-5">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  className={`h-16 w-16 rounded-full border p-1 transition ${selectedColor.name === color.name ? "border-neutral-700" : "border-transparent"}`}
                  aria-label={color.name}
                >
                  <span className="block h-full w-full rounded-full border border-black/5" style={{ backgroundColor: color.value }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="border-t border-neutral-200 px-6 py-8 lg:h-screen lg:overflow-y-auto lg:border-l lg:border-t-0 lg:px-8">
          <section id="analysis">
            <div className="text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
                <Sparkles size={19} />
              </div>
              <h2 className="mt-4 text-3xl font-semibold">Fabric profile</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">Capture color, texture, pattern, and fabric type to generate style directions.</p>
            </div>

            <button
              onClick={() => fileRef.current?.click()}
              className="mt-8 flex w-full items-center justify-between rounded-[8px] border border-neutral-300 px-4 py-4 text-left transition hover:border-neutral-600"
            >
              <span className="flex items-center gap-3">
                <Upload size={18} />
                <span>
                  <span className="block font-semibold">Upload fabric image</span>
                  <span className="text-sm text-neutral-500">Optional image-based extraction</span>
                </span>
              </span>
              <ChevronRight size={18} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) analyzeImage(file);
              }}
            />

            <div className="mt-7 space-y-5">
              <OptionGroup label="Fabric type" options={fabricTypes} value={fabricType} onChange={setFabricType} icon={<Shirt size={17} />} />
              <OptionGroup label="Texture" options={textures} value={texture} onChange={setTexture} icon={<Layers size={17} />} />
              <OptionGroup label="Pattern" options={patterns} value={pattern} onChange={setPattern} icon={<Camera size={17} />} />
              <OptionGroup label="Occasion" options={occasions} value={occasion} onChange={setOccasion} icon={<Sparkles size={17} />} />
            </div>

            <div className="mt-8 rounded-[8px] border border-neutral-200 bg-neutral-50 p-5">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Processing confidence</span>
                <span className="text-lg font-semibold">{confidence}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-neutral-200">
                <div className="h-2 rounded-full bg-[#171a20]" style={{ width: `${confidence}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-neutral-600">
                <Metric label="Color" value={selectedColor.name} color={selectedColor.value} />
                <Metric label="Texture" value={imageSignal?.texture || texture} />
                <Metric label="Pattern" value={pattern} />
                <Metric label="Brightness" value={imageSignal ? `${imageSignal.brightness}/255` : "Manual"} />
              </div>
            </div>
          </section>

          <section id="recommendations" className="mt-12">
            <h2 className="text-center text-2xl font-semibold">Recommended styles</h2>
            <div className="mt-6 space-y-3">
              {recommendations.map((item, index) => (
                <article key={item.title} className={`rounded-[8px] border p-4 ${index === 0 ? "border-neutral-800" : "border-neutral-200"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-neutral-500">{item.detail}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold">{item.match}%</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div
              className="mt-6 rounded-[8px] px-5 py-4 text-sm font-medium"
              style={{ backgroundColor: selectedColor.value, color: getContrast(selectedColor.value) }}
            >
              <div className="flex items-center gap-2">
                <Check size={17} />
                <span>Best match: {recommendations[0].title}</span>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function OptionGroup({ label, options, value, onChange, icon }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`rounded-[8px] border px-3 py-3 text-left text-sm font-semibold transition ${
              value === option ? "border-neutral-800 bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div className="rounded-[8px] bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">{label}</p>
      <div className="mt-2 flex items-center gap-2 font-semibold text-neutral-800">
        {color ? <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: color }} /> : null}
        <span>{value}</span>
      </div>
    </div>
  );
}
