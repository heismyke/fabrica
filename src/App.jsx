import { useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  FileText,
  Layers,
  Printer,
  Ruler,
  ScanLine,
  Shirt,
  Truck,
  Upload,
  UserRound,
} from "lucide-react";

const colors = [
  { name: "Ivory", value: "#f5f1e8" },
  { name: "Rose", value: "#d89aa5" },
  { name: "Sage", value: "#8fa58a" },
  { name: "Cobalt", value: "#153d78" },
  { name: "Charcoal", value: "#2c2f35" },
  { name: "Ruby", value: "#bd1519" },
];

const fabricTypes = ["Cotton", "Silk", "Linen", "Chiffon", "Denim", "Wool"];
const textures = ["Smooth", "Crisp", "Soft", "Ribbed", "Sheer", "Structured"];
const patterns = ["Plain", "Stripes", "Check", "Floral"];
const genders = ["Female", "Male"];
const collectionModes = ["Pickup", "Delivery"];

const styleTemplates = {
  Female: [
    { name: "A-line dress", complexity: 1.25, labor: 18000, days: 4 },
    { name: "Blouse and skirt", complexity: 1.15, labor: 16000, days: 3 },
    { name: "Jumpsuit", complexity: 1.35, labor: 22000, days: 5 },
    { name: "Evening gown", complexity: 1.65, labor: 30000, days: 7 },
  ],
  Male: [
    { name: "Native set", complexity: 1.2, labor: 17000, days: 4 },
    { name: "Long sleeve shirt", complexity: 1.0, labor: 12000, days: 2 },
    { name: "Kaftan", complexity: 1.3, labor: 19000, days: 4 },
    { name: "Two-piece suit", complexity: 1.7, labor: 38000, days: 8 },
  ],
};

const patternClasses = {
  Plain: "pattern-plain",
  Stripes: "pattern-stripes",
  Check: "pattern-check",
  Floral: "pattern-floral",
};

const initialMeasurements = {
  chest: 38,
  waist: 32,
  hip: 40,
  shoulder: 16,
  sleeve: 23,
  length: 42,
};

const formatMoney = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function readImage(file, onLoad) {
  const reader = new FileReader();
  reader.onload = (event) => onLoad(event.target.result);
  reader.readAsDataURL(file);
}

function analyzeFabricImage(src, setTexture, setImageSignal) {
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

    for (let index = 0; index < data.length; index += 4) {
      red += data[index];
      green += data[index + 1];
      blue += data[index + 2];
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
}

function calculateSummary({ gender, style, fabricType, pattern, measurements, collectionMode, fabricPrice }) {
  const baseYardage = gender === "Female" ? 4 : 3;
  const bodyFactor = (Number(measurements.chest) + Number(measurements.hip) + Number(measurements.length)) / 150;
  const patternAllowance = pattern === "Plain" ? 0 : pattern === "Floral" ? 0.35 : 0.25;
  const fabricAllowance = ["Chiffon", "Silk"].includes(fabricType) ? 0.2 : 0;
  const yardage = Math.ceil((baseYardage + bodyFactor * style.complexity + patternAllowance + fabricAllowance) * 2) / 2;
  const deliveryFee = collectionMode === "Delivery" ? 3000 : 0;
  const materialEstimate = yardage * Number(fabricPrice || 0);
  const total = materialEstimate + style.labor + deliveryFee;
  const completionDays = Math.ceil(style.days + (style.complexity > 1.5 ? 1 : 0) + (fabricType === "Wool" ? 1 : 0));

  return {
    yardage,
    completionDays,
    materialEstimate,
    labor: style.labor,
    deliveryFee,
    total,
  };
}

export default function App() {
  const [selectedColor, setSelectedColor] = useState(colors[4]);
  const [fabricType, setFabricType] = useState("Cotton");
  const [texture, setTexture] = useState("Smooth");
  const [pattern, setPattern] = useState("Plain");
  const [gender, setGender] = useState("Female");
  const [selectedStyle, setSelectedStyle] = useState(styleTemplates.Female[0].name);
  const [collectionMode, setCollectionMode] = useState("Pickup");
  const [fabricPrice, setFabricPrice] = useState(3500);
  const [measurements, setMeasurements] = useState(initialMeasurements);
  const [fabricPreview, setFabricPreview] = useState("");
  const [stylePreview, setStylePreview] = useState("");
  const [imageSignal, setImageSignal] = useState(null);
  const fabricInputRef = useRef(null);
  const styleInputRef = useRef(null);

  const availableStyles = styleTemplates[gender];
  const style = availableStyles.find((item) => item.name === selectedStyle) || availableStyles[0];

  const summary = useMemo(
    () => calculateSummary({ gender, style, fabricType, pattern, measurements, collectionMode, fabricPrice }),
    [gender, style, fabricType, pattern, measurements, collectionMode, fabricPrice]
  );

  const validation = useMemo(() => {
    const values = Object.values(measurements).map(Number);
    const validValues = values.filter((value) => value >= 8 && value <= 90);
    return Math.round((validValues.length / values.length) * 100);
  }, [measurements]);

  function updateMeasurement(name, value) {
    setMeasurements((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleGenderChange(nextGender) {
    setGender(nextGender);
    setSelectedStyle(styleTemplates[nextGender][0].name);
  }

  function handleFabricUpload(file) {
    readImage(file, (src) => {
      setFabricPreview(src);
      analyzeFabricImage(src, setTexture, setImageSignal);
    });
  }

  return (
    <main className="min-h-screen bg-white text-[#171a20]">
      <header className="fixed left-0 right-0 top-0 z-20 flex h-16 items-center justify-between bg-white/90 px-6 backdrop-blur md:px-10">
        <div className="tracking-[0.46em] text-sm font-semibold uppercase">Fabrica</div>
        <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-500 md:flex">
          <a href="#fabric">Fabric</a>
          <a href="#measurements">Measurements</a>
          <a href="#summary">Summary</a>
        </nav>
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200" aria-label="Simulation status">
          <ScanLine size={18} />
        </button>
      </header>

      <section className="grid min-h-screen grid-cols-1 pt-16 lg:grid-cols-[1fr_430px]">
        <div className="flex min-h-[680px] flex-col items-center justify-center px-6 py-10 lg:min-h-screen">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-neutral-400">Fabric-to-style simulation system</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">Preview before tailoring</h1>
          </div>

          <div className="relative w-full max-w-4xl">
            <div className="absolute left-1/2 top-8 h-80 w-80 -translate-x-1/2 rounded-full bg-neutral-100 blur-3xl" />
            <div
              className={`fabric-grain ${patternClasses[pattern]} relative mx-auto aspect-[16/9] w-full overflow-hidden rounded-[8px] shadow-soft`}
              style={{ backgroundColor: selectedColor.value }}
            >
              {fabricPreview ? (
                <img src={fabricPreview} alt="Uploaded fabric preview" className="absolute inset-0 h-full w-full object-cover mix-blend-multiply opacity-75" />
              ) : null}
              <GarmentPreview gender={gender} styleName={style.name} stylePreview={stylePreview} />
              <div className="absolute bottom-6 left-6 rounded bg-black/70 px-3 py-2 text-xs font-medium text-white">
                {style.name} / {fabricType} / {summary.yardage.toFixed(1)} yards
              </div>
            </div>
          </div>

          <div id="fabric" className="mt-12 w-full max-w-3xl text-center">
            <p className="text-lg font-semibold text-neutral-500">Selected fabric</p>
            <h2 className="mt-2 text-3xl font-semibold">
              {selectedColor.name} {fabricType}
            </h2>
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
          <section>
            <div className="text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
                <Shirt size={19} />
              </div>
              <h2 className="mt-4 text-3xl font-semibold">Order simulation</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Upload fabric and style references, enter measurements, and generate yardage, time, and estimate details.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <UploadButton
                label="Fabric image"
                detail={fabricPreview ? "Uploaded" : "Upload"}
                icon={<Upload size={18} />}
                onClick={() => fabricInputRef.current?.click()}
              />
              <UploadButton
                label="Style image"
                detail={stylePreview ? "Uploaded" : "Upload"}
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
                if (file) handleFabricUpload(file);
              }}
            />
            <input
              ref={styleInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) readImage(file, setStylePreview);
              }}
            />

            <div className="mt-7 space-y-5">
              <OptionGroup label="Gender" options={genders} value={gender} onChange={handleGenderChange} icon={<UserRound size={17} />} />
              <OptionGroup label="Style template" options={availableStyles.map((item) => item.name)} value={style.name} onChange={setSelectedStyle} icon={<FileText size={17} />} />
              <OptionGroup label="Fabric type" options={fabricTypes} value={fabricType} onChange={setFabricType} icon={<Shirt size={17} />} />
              <OptionGroup label="Texture" options={textures} value={texture} onChange={setTexture} icon={<Layers size={17} />} />
              <OptionGroup label="Pattern" options={patterns} value={pattern} onChange={setPattern} icon={<Camera size={17} />} />
            </div>
          </section>

          <section id="measurements" className="mt-10">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-500">
              <Ruler size={17} />
              <span>Body measurements in inches</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(measurements).map(([name, value]) => (
                <label key={name} className="rounded-[8px] border border-neutral-200 px-3 py-2">
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">{name}</span>
                  <input
                    type="number"
                    min="8"
                    max="90"
                    value={value}
                    onChange={(event) => updateMeasurement(name, event.target.value)}
                    className="mt-1 w-full bg-transparent text-lg font-semibold outline-none"
                  />
                </label>
              ))}
            </div>

            <label className="mt-3 block rounded-[8px] border border-neutral-200 px-3 py-2">
              <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Fabric price per yard</span>
              <input
                type="number"
                min="0"
                value={fabricPrice}
                onChange={(event) => setFabricPrice(event.target.value)}
                className="mt-1 w-full bg-transparent text-lg font-semibold outline-none"
              />
            </label>
          </section>

          <section className="mt-8">
            <OptionGroup label="Mode of collection" options={collectionModes} value={collectionMode} onChange={setCollectionMode} icon={<Truck size={17} />} />
          </section>

          <section id="summary" className="mt-8 rounded-[8px] border border-neutral-200 bg-neutral-50 p-5">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Input validation</span>
              <span className="text-lg font-semibold">{validation}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-neutral-200">
              <div className="h-2 rounded-full bg-[#171a20]" style={{ width: `${validation}%` }} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-neutral-600">
              <Metric label="Yardage" value={`${summary.yardage.toFixed(1)} yards`} />
              <Metric label="Completion" value={`${summary.completionDays} days`} icon={<CalendarDays size={16} />} />
              <Metric label="Texture" value={imageSignal?.texture || texture} />
              <Metric label="Brightness" value={imageSignal ? `${imageSignal.brightness}/255` : "Manual"} />
            </div>

            <div className="mt-6 space-y-3 border-t border-neutral-200 pt-5 text-sm">
              <SummaryRow label="Material estimate" value={formatMoney.format(summary.materialEstimate)} />
              <SummaryRow label="Tailoring labor" value={formatMoney.format(summary.labor)} />
              <SummaryRow label="Collection fee" value={formatMoney.format(summary.deliveryFee)} />
              <SummaryRow label="Estimated total" value={formatMoney.format(summary.total)} strong />
            </div>

            <button
              onClick={() => window.print()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#171a20] px-4 py-3 text-sm font-semibold text-white transition hover:bg-black"
            >
              <Printer size={17} />
              Print summary
            </button>
          </section>

          <div className="mt-6 rounded-[8px] border border-neutral-200 px-5 py-4 text-sm font-medium">
            <div className="flex items-start gap-2">
              <Check size={17} className="mt-0.5 shrink-0" />
              <span>
                Simulation generated from selected fabric, style template, body measurements, collection mode, and predefined tailoring rules.
              </span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function GarmentPreview({ gender, styleName, stylePreview }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {stylePreview ? (
        <img src={stylePreview} alt="Uploaded style reference" className="h-[78%] max-w-[48%] rounded-[8px] object-cover opacity-45 mix-blend-luminosity" />
      ) : null}
      <div className="relative h-[70%] w-[38%] min-w-[220px]">
        <div className="absolute left-1/2 top-0 h-[16%] w-[18%] -translate-x-1/2 rounded-full border border-white/35 bg-white/18" />
        <div className="absolute left-1/2 top-[14%] h-[58%] w-[44%] -translate-x-1/2 rounded-t-[42%] border border-white/35 bg-white/16 shadow-[inset_0_30px_70px_rgba(255,255,255,0.25)]" />
        <div className="absolute left-[12%] top-[20%] h-[38%] w-[22%] -rotate-12 rounded-full border border-white/20 bg-white/12" />
        <div className="absolute right-[12%] top-[20%] h-[38%] w-[22%] rotate-12 rounded-full border border-white/20 bg-white/12" />
        <div className={`absolute bottom-0 left-1/2 h-[34%] -translate-x-1/2 border border-white/25 bg-white/12 ${gender === "Female" ? "w-[62%] rounded-b-[44%]" : "w-[44%] rounded-b-[18px]"}`} />
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded bg-black/55 px-3 py-1.5 text-xs font-medium text-white">
          {styleName}
        </div>
      </div>
    </div>
  );
}

function UploadButton({ label, detail, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between rounded-[8px] border border-neutral-300 px-4 py-4 text-left transition hover:border-neutral-600"
    >
      <span className="flex min-w-0 items-center gap-3">
        {icon}
        <span className="min-w-0">
          <span className="block truncate font-semibold">{label}</span>
          <span className="text-sm text-neutral-500">{detail}</span>
        </span>
      </span>
      <ChevronRight size={18} className="shrink-0" />
    </button>
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

function Metric({ label, value, icon }) {
  return (
    <div className="rounded-[8px] bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">{label}</p>
      <div className="mt-2 flex items-center gap-2 font-semibold text-neutral-800">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, strong = false }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? "text-base font-semibold text-neutral-950" : "text-neutral-600"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
