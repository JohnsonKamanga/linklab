import QRCode from "qrcode";

const INK = "#075740";
const PAPER = "#ffffff";
const EXPORT_SIZE = 1200;
const QUIET_ZONE = 4;
const LOGO_PATH = "/linlklab-logo-only.png";

function loadLogo(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const logo = new Image();
    logo.onload = () => resolve(logo);
    logo.onerror = () =>
      reject(new Error("The LinkLab logo could not be loaded."));
    logo.src = LOGO_PATH;
  });
}

function fillRoundedSquare(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  radius: number,
  fill: string,
) {
  context.fillStyle = fill;
  context.beginPath();
  context.roundRect(x, y, size, size, radius);
  context.fill();
}

/** A single, branded PNG for both the on-screen preview and download. */
export async function createBrandedQr(url: string): Promise<string> {
  const logo = await loadLogo();
  // H preserves the data when the small central brand tile covers some modules.
  const { modules } = QRCode.create(url, { errorCorrectionLevel: "H" });
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = EXPORT_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not create the QR image.");

  const cell = EXPORT_SIZE / (modules.size + QUIET_ZONE * 2);
  const offset = QUIET_ZONE * cell;
  context.fillStyle = PAPER;
  context.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);

  const eyes = [
    [0, 0],
    [modules.size - 7, 0],
    [0, modules.size - 7],
  ];
  for (let row = 0; row < modules.size; row++) {
    for (let column = 0; column < modules.size; column++) {
      if (!modules.get(row, column)) continue;
      if (
        eyes.some(
          ([x, y]) => column >= x && column < x + 7 && row >= y && row < y + 7,
        )
      )
        continue;
      // Keep timing, alignment, and format modules intact. Data modules get a
      // restrained corner radius rather than tiny dots that reduce scan contrast.
      const reserved = modules.isReserved(row, column);
      const inset = reserved ? 0 : cell * 0.055;
      fillRoundedSquare(
        context,
        offset + column * cell + inset,
        offset + row * cell + inset,
        cell - inset * 2,
        reserved ? 0 : cell * 0.28,
        INK,
      );
    }
  }

  // Three rounded, concentric finder eyes give the code its own visual signature.
  for (const [column, row] of eyes) {
    const x = offset + column * cell;
    const y = offset + row * cell;
    fillRoundedSquare(context, x, y, cell * 7, cell * 1.65, INK);
    fillRoundedSquare(
      context,
      x + cell,
      y + cell,
      cell * 5,
      cell * 1.02,
      PAPER,
    );
    fillRoundedSquare(
      context,
      x + cell * 2,
      y + cell * 2,
      cell * 3,
      cell * 0.65,
      INK,
    );
  }

  // An odd number of modules keeps the badge precisely centered on the matrix.
  // The white clearance is separate from the untouched outer quiet zone.
  const tileCells = Math.max(5, Math.floor(modules.size * 0.17) | 1);
  const tileSize = tileCells * cell;
  const tileStart = (EXPORT_SIZE - tileSize) / 2;
  const clearance = cell * 0.65;
  fillRoundedSquare(
    context,
    tileStart - clearance,
    tileStart - clearance,
    tileSize + clearance * 2,
    cell,
    PAPER,
  );
  fillRoundedSquare(
    context,
    tileStart,
    tileStart,
    tileSize,
    cell * 0.8,
    "#efeddf",
  );
  context.save();
  context.beginPath();
  context.roundRect(tileStart, tileStart, tileSize, tileSize, cell * 0.8);
  context.clip();
  // Preserve the supplied mark on a warm ivory tile, including its transparency.
  context.drawImage(logo, tileStart, tileStart, tileSize, tileSize);
  context.restore();

  return canvas.toDataURL("image/png");
}
