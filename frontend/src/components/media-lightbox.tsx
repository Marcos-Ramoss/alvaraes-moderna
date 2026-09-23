import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";

import { Dialog, DialogContent } from "./ui/dialog";

type LightboxImage = {
  id: string;
  url: string;
  alt: string;
};

type MediaLightboxProps = {
  images: LightboxImage[];
  title: string;
};

type Point = {
  x: number;
  y: number;
};

type PointerPosition = {
  x: number;
  y: number;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.5;

const SWIPE_THRESHOLD = 70;
const CLOSE_SWIPE_THRESHOLD = 110;
const TAP_MOVE_THRESHOLD = 12;
const DOUBLE_TAP_DELAY = 300;

export function MediaLightbox({
  images,
  title,
}: MediaLightboxProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const [zoom, setZoom] = useState(1);

  const [pan, setPan] = useState<Point>({
    x: 0,
    y: 0,
  });

  const [gestureOffset, setGestureOffset] = useState<Point>({
    x: 0,
    y: 0,
  });

  const viewerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const pointers = useRef(
    new Map<number, PointerPosition>(),
  );

  const pointerStart = useRef({
    x: 0,
    y: 0,
    time: 0,
    panX: 0,
    panY: 0,
  });

  const pinchStart = useRef<{
    distance: number;
    zoom: number;
    centerX: number;
    centerY: number;
    panX: number;
    panY: number;
  } | null>(null);

  const lastTapAt = useRef(0);

  const primaryImage = images[0];
  const activeImage = images[activeIndex] ?? primaryImage;

  /*
   * =========================================================
   * RESET
   * =========================================================
   */

  function resetTransform() {
    setZoom(1);

    setPan({
      x: 0,
      y: 0,
    });

    setGestureOffset({
      x: 0,
      y: 0,
    });

    pinchStart.current = null;
    pointers.current.clear();
  }

  /*
   * =========================================================
   * ABRIR / FECHAR
   * =========================================================
   */

  function openImage(index: number) {
    setActiveIndex(index);
    resetTransform();
    setOpen(true);
  }

  function close() {
    setOpen(false);
    resetTransform();
  }

  /*
   * =========================================================
   * NAVEGAÇÃO
   * =========================================================
   */

  function previousImage() {
    if (images.length <= 1) return;

    setActiveIndex((index) =>
      (index - 1 + images.length) % images.length,
    );

    resetTransform();
  }

  function nextImage() {
    if (images.length <= 1) return;

    setActiveIndex((index) =>
      (index + 1) % images.length,
    );

    resetTransform();
  }

  /*
   * =========================================================
   * LIMITADOR DE PAN
   * =========================================================
   */

  function clampPan(
    x: number,
    y: number,
    targetZoom = zoom,
  ): Point {
    const viewer = viewerRef.current;
    const image = imageRef.current;

    if (!viewer || !image || targetZoom <= 1) {
      return {
        x: 0,
        y: 0,
      };
    }

    const viewerWidth = viewer.clientWidth;
    const viewerHeight = viewer.clientHeight;

    const imageWidth = image.clientWidth;
    const imageHeight = image.clientHeight;

    const scaledWidth = imageWidth * targetZoom;
    const scaledHeight = imageHeight * targetZoom;

    const maxX = Math.max(
      0,
      (scaledWidth - viewerWidth) / 2,
    );

    const maxY = Math.max(
      0,
      (scaledHeight - viewerHeight) / 2,
    );

    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }

  /*
   * =========================================================
   * ALTERAÇÃO DO ZOOM
   * =========================================================
   */

  function changeZoom(value: number) {
    const nextZoom = Math.min(
      MAX_ZOOM,
      Math.max(MIN_ZOOM, value),
    );

    setZoom(nextZoom);

    if (nextZoom <= 1) {
      setPan({
        x: 0,
        y: 0,
      });

      return;
    }

    setPan((current) =>
      clampPan(
        current.x,
        current.y,
        nextZoom,
      ),
    );
  }

  /*
   * =========================================================
   * DOUBLE TAP / DOUBLE CLICK
   * =========================================================
   */

  function toggleDetailZoom(
    clientX?: number,
    clientY?: number,
  ) {
    if (zoom > 1) {
      resetTransform();
      return;
    }

    const viewer = viewerRef.current;

    if (!viewer || clientX === undefined || clientY === undefined) {
      setZoom(DOUBLE_TAP_ZOOM);
      return;
    }

    const rect = viewer.getBoundingClientRect();

    const touchX = clientX - rect.left;
    const touchY = clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    /*
     * Move a região tocada em direção ao centro
     * durante a ampliação.
     */
    const panX =
      -(touchX - centerX) *
      (DOUBLE_TAP_ZOOM - 1);

    const panY =
      -(touchY - centerY) *
      (DOUBLE_TAP_ZOOM - 1);

    setZoom(DOUBLE_TAP_ZOOM);

    requestAnimationFrame(() => {
      setPan(
        clampPan(
          panX,
          panY,
          DOUBLE_TAP_ZOOM,
        ),
      );
    });
  }

  /*
   * =========================================================
   * DISTÂNCIA ENTRE DOIS PONTEIROS
   * =========================================================
   */

  function getDistance(
    first: PointerPosition,
    second: PointerPosition,
  ) {
    return Math.hypot(
      second.x - first.x,
      second.y - first.y,
    );
  }

  function getCenter(
    first: PointerPosition,
    second: PointerPosition,
  ) {
    return {
      x: (first.x + second.x) / 2,
      y: (first.y + second.y) / 2,
    };
  }

  /*
   * =========================================================
   * POINTER DOWN
   * =========================================================
   */

  function handlePointerDown(
    event: ReactPointerEvent<HTMLImageElement>,
  ) {
    event.currentTarget.setPointerCapture(
      event.pointerId,
    );

    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    /*
     * Primeiro dedo / mouse
     */
    if (pointers.current.size === 1) {
      pointerStart.current = {
        x: event.clientX,
        y: event.clientY,
        time: Date.now(),
        panX: pan.x,
        panY: pan.y,
      };
    }

    /*
     * Dois dedos -> inicia pinch
     */
    if (pointers.current.size === 2) {
      const values = Array.from(
        pointers.current.values(),
      );

      const first = values[0];
      const second = values[1];

      if (!first || !second) return;

      const distance = getDistance(
        first,
        second,
      );

      const center = getCenter(
        first,
        second,
      );

      const viewer =
        viewerRef.current?.getBoundingClientRect();

      pinchStart.current = {
        distance,
        zoom,

        centerX:
          center.x -
          (viewer?.left ?? 0),

        centerY:
          center.y -
          (viewer?.top ?? 0),

        panX: pan.x,
        panY: pan.y,
      };

      setGestureOffset({
        x: 0,
        y: 0,
      });
    }
  }

  /*
   * =========================================================
   * POINTER MOVE
   * =========================================================
   */

  function handlePointerMove(
    event: ReactPointerEvent<HTMLImageElement>,
  ) {
    if (
      !pointers.current.has(
        event.pointerId,
      )
    ) {
      return;
    }

    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    /*
     * =======================================================
     * PINCH ZOOM
     * =======================================================
     */

    if (
      pointers.current.size === 2 &&
      pinchStart.current
    ) {
      event.preventDefault();

      const values = Array.from(
        pointers.current.values(),
      );

      const first = values[0];
      const second = values[1];

      if (!first || !second) return;

      const currentDistance = getDistance(
        first,
        second,
      );

      const currentCenter = getCenter(
        first,
        second,
      );

      const viewer = viewerRef.current;

      if (!viewer) return;

      const rect =
        viewer.getBoundingClientRect();

      const currentCenterX =
        currentCenter.x - rect.left;

      const currentCenterY =
        currentCenter.y - rect.top;

      const scale =
        currentDistance /
        pinchStart.current.distance;

      const nextZoom = Math.min(
        MAX_ZOOM,
        Math.max(
          MIN_ZOOM,
          pinchStart.current.zoom *
            scale,
        ),
      );

      /*
       * Mantém o zoom próximo da posição
       * dos dedos.
       */
      const zoomRatio =
        nextZoom /
        pinchStart.current.zoom;

      const nextPanX =
        currentCenterX -
        rect.width / 2 -
        zoomRatio *
          (
            pinchStart.current.centerX -
            rect.width / 2 -
            pinchStart.current.panX
          );

      const nextPanY =
        currentCenterY -
        rect.height / 2 -
        zoomRatio *
          (
            pinchStart.current.centerY -
            rect.height / 2 -
            pinchStart.current.panY
          );

      setZoom(nextZoom);

      setPan(
        clampPan(
          nextPanX,
          nextPanY,
          nextZoom,
        ),
      );

      return;
    }

    /*
     * =======================================================
     * UM DEDO
     * =======================================================
     */

    if (pointers.current.size !== 1) {
      return;
    }

    const deltaX =
      event.clientX -
      pointerStart.current.x;

    const deltaY =
      event.clientY -
      pointerStart.current.y;

    /*
     * Se estiver ampliado:
     * arrasta a imagem.
     */
    if (zoom > 1) {
      const nextX =
        pointerStart.current.panX +
        deltaX;

      const nextY =
        pointerStart.current.panY +
        deltaY;

      setPan(
        clampPan(
          nextX,
          nextY,
          zoom,
        ),
      );

      return;
    }

    /*
     * Se não estiver ampliado:
     * movimento será utilizado
     * para swipe.
     */
    setGestureOffset({
      x: deltaX,
      y: deltaY,
    });
  }

  /*
   * =========================================================
   * POINTER UP
   * =========================================================
   */

  function handlePointerUp(
    event: ReactPointerEvent<HTMLImageElement>,
  ) {
    const totalPointers =
      pointers.current.size;

    /*
     * Se estava usando dois dedos,
     * não processa swipe nem double tap.
     */
    if (totalPointers > 1) {
      pointers.current.delete(
        event.pointerId,
      );

      pinchStart.current = null;

      const remaining =
        Array.from(
          pointers.current.values(),
        )[0];

      if (remaining) {
        pointerStart.current = {
          x: remaining.x,
          y: remaining.y,
          time: Date.now(),
          panX: pan.x,
          panY: pan.y,
        };
      }

      return;
    }

    pointers.current.delete(
      event.pointerId,
    );

    const deltaX =
      event.clientX -
      pointerStart.current.x;

    const deltaY =
      event.clientY -
      pointerStart.current.y;

    const distance = Math.hypot(
      deltaX,
      deltaY,
    );

    /*
     * Se estiver com zoom:
     * apenas termina o movimento.
     */
    if (zoom > 1) {
      return;
    }

    /*
     * =======================================================
     * SWIPE HORIZONTAL
     * =======================================================
     */

    if (
      Math.abs(deltaX) >
        SWIPE_THRESHOLD &&
      Math.abs(deltaX) >
        Math.abs(deltaY) * 1.15
    ) {
      if (deltaX < 0) {
        nextImage();
      } else {
        previousImage();
      }

      return;
    }

    /*
     * =======================================================
     * SWIPE PARA BAIXO = FECHAR
     * =======================================================
     */

    if (
      deltaY >
        CLOSE_SWIPE_THRESHOLD &&
      Math.abs(deltaY) >
        Math.abs(deltaX) * 1.2
    ) {
      close();
      return;
    }

    setGestureOffset({
      x: 0,
      y: 0,
    });

    /*
     * =======================================================
     * DOUBLE TAP
     * =======================================================
     */

    if (
      event.pointerType === "touch" &&
      distance <
        TAP_MOVE_THRESHOLD
    ) {
      const now = Date.now();

      if (
        now - lastTapAt.current <
        DOUBLE_TAP_DELAY
      ) {
        event.preventDefault();

        toggleDetailZoom(
          event.clientX,
          event.clientY,
        );

        lastTapAt.current = 0;
        return;
      }

      lastTapAt.current = now;
    }
  }

  /*
   * =========================================================
   * CANCELAMENTO DO GESTO
   * =========================================================
   */

  function handlePointerCancel(
    event: ReactPointerEvent<HTMLImageElement>,
  ) {
    pointers.current.delete(
      event.pointerId,
    );

    pinchStart.current = null;

    setGestureOffset({
      x: 0,
      y: 0,
    });
  }

  /*
   * =========================================================
   * DOUBLE CLICK DESKTOP
   * =========================================================
   */

  function handleDoubleClick(
    event: ReactPointerEvent<HTMLImageElement>,
  ) {
    toggleDetailZoom(
      event.clientX,
      event.clientY,
    );
  }

  /*
   * =========================================================
   * MOUSE WHEEL
   * =========================================================
   */

  function handleWheel(
    event: ReactWheelEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    const direction =
      event.deltaY < 0 ? 1 : -1;

    changeZoom(
      zoom + direction * 0.25,
    );
  }

  /*
   * =========================================================
   * TECLADO
   * =========================================================
   */

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "ArrowLeft") {
        previousImage();
      }

      if (event.key === "ArrowRight") {
        nextImage();
      }

      if (event.key === "Escape") {
        close();
      }

      if (
        event.key === "+" ||
        event.key === "="
      ) {
        changeZoom(
          zoom + 0.25,
        );
      }

      if (event.key === "-") {
        changeZoom(
          zoom - 0.25,
        );
      }

      if (event.key === "0") {
        resetTransform();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    open,
    zoom,
    images.length,
  ]);

  /*
   * =========================================================
   * GARANTE RESET AO TROCAR DE IMAGEM
   * =========================================================
   */

  useEffect(() => {
    if (!open) return;

    resetTransform();
  }, [activeIndex]);

  if (!primaryImage || !activeImage) {
    return null;
  }

  const verticalCloseProgress =
    zoom === 1
      ? Math.min(
          Math.max(
            gestureOffset.y,
            0,
          ) / 300,
          0.45,
        )
      : 0;

  const imageOpacity =
    1 - verticalCloseProgress;

  return (
    <>
      {/* =====================================================
          GALERIA DA PÁGINA
          ===================================================== */}

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => openImage(0)}
          className="
            group
            relative
            block
            w-full
            overflow-hidden
            rounded-xl
            text-left
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-primary
          "
          aria-label={`Ampliar imagem principal de ${title}`}
        >
          <img onError={(e) => { e.currentTarget.style.display = 'none'; }} src={primaryImage.url}
            alt={primaryImage.alt}
            className="
              aspect-[16/9]
              w-full
              object-cover
              transition-transform
              duration-300
              group-hover:scale-[1.02]
            "
          />

          <span
            className="
              absolute
              bottom-3
              right-3
              rounded-full
              bg-black/65
              px-3
              py-1.5
              text-xs
              font-semibold
              text-white
              backdrop-blur-sm
            "
          >
            Ampliar imagem
          </span>
        </button>

        {images.length > 1 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {images
              .slice(1)
              .map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() =>
                    openImage(
                      index + 1,
                    )
                  }
                  className="
                    overflow-hidden
                    rounded-lg
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-primary
                  "
                  aria-label={`Ampliar imagem ${index + 2} de ${title}`}
                >
                  <img onError={(e) => { e.currentTarget.style.display = 'none'; }} src={image.url}
                    alt={image.alt}
                    className="
                      aspect-[4/3]
                      w-full
                      object-cover
                      transition-transform
                      duration-300
                      hover:scale-[1.04]
                    "
                  />
                </button>
              ))}
          </div>
        )}
      </div>

      {/* =====================================================
          LIGHTBOX
          ===================================================== */}

      <Dialog
        open={open}
        onOpenChange={(value) =>
          value
            ? setOpen(true)
            : close()
        }
      >
        <DialogContent
          className="
            flex
            h-[100dvh]
            w-screen
            max-w-none
            flex-col
            gap-0
            overflow-hidden
            rounded-none
            border-none
            bg-black
            p-0
            text-white

            sm:h-[92vh]
            sm:w-[96vw]
            sm:max-w-6xl
            sm:rounded-2xl
          "
        >
          {/* =================================================
              BARRA SUPERIOR
              ================================================= */}

          <div
            className="
              relative
              z-30
              flex
              min-h-[64px]
              shrink-0
              items-center
              justify-between
              gap-3
              border-b
              border-white/10
              bg-black/80
              px-3
              backdrop-blur-xl
              sm:px-4
            "
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {title}
              </p>

              <p className="text-xs text-white/55">
                {activeIndex + 1} de{" "}
                {images.length}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  changeZoom(
                    zoom - 0.25,
                  )
                }
                disabled={zoom <= MIN_ZOOM}
                className="
                  flex
                  size-11
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                  transition
                  hover:bg-white/20
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
                aria-label="Diminuir zoom"
              >
                <Minus className="size-4" />
              </button>

              <button
                type="button"
                onClick={resetTransform}
                className="
                  flex
                  h-11
                  min-w-11
                  items-center
                  justify-center
                  gap-1
                  rounded-full
                  bg-white/10
                  px-3
                  text-xs
                  font-semibold
                  transition
                  hover:bg-white/20
                "
                aria-label="Restaurar zoom"
              >
                {Math.round(
                  zoom * 100,
                )}
                %
              </button>

              <button
                type="button"
                onClick={() =>
                  changeZoom(
                    zoom + 0.25,
                  )
                }
                disabled={zoom >= MAX_ZOOM}
                className="
                  flex
                  size-11
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                  transition
                  hover:bg-white/20
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
                aria-label="Aumentar zoom"
              >
                <Plus className="size-4" />
              </button>

              <button
                type="button"
                onClick={resetTransform}
                className="
                  hidden
                  size-11
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                  transition
                  hover:bg-white/20
                  sm:flex
                "
                aria-label="Resetar imagem"
              >
                <RotateCcw className="size-4" />
              </button>

              <button
                type="button"
                onClick={close}
                className="
                  ml-1
                  flex
                  size-11
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                  transition
                  hover:bg-white/20
                "
                aria-label="Fechar visualizador"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* =================================================
              VISUALIZADOR
              ================================================= */}

          <div
            ref={viewerRef}
            onWheel={handleWheel}
            className="
              relative
              flex
              min-h-0
              flex-1
              items-center
              justify-center
              overflow-hidden
              overscroll-none
              bg-black
              select-none
            "
          >
            <img
              ref={imageRef}
              src={activeImage.url}
              alt={`${activeImage.alt}. Use dois dedos para ampliar, arraste quando ampliada ou deslize para trocar de imagem.`}
              draggable={false}
              onPointerDown={
                handlePointerDown
              }
              onPointerMove={
                handlePointerMove
              }
              onPointerUp={
                handlePointerUp
              }
              onPointerCancel={
                handlePointerCancel
              }
              onDoubleClick={
                handleDoubleClick
              }
              className={`
                max-h-full
                max-w-full
                touch-none
                select-none
                object-contain
                will-change-transform

                ${
                  zoom > 1
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-zoom-in"
                }
              `}
              style={{
                transform: `
                  translate3d(
                    ${
                      pan.x +
                      (zoom === 1
                        ? gestureOffset.x
                        : 0)
                    }px,
                    ${
                      pan.y +
                      (zoom === 1
                        ? gestureOffset.y
                        : 0)
                    }px,
                    0
                  )
                  scale(${zoom})
                `,
                opacity:
                  imageOpacity,
                transition:
                  pointers.current
                    .size > 0
                    ? "none"
                    : "transform 180ms ease-out, opacity 180ms ease-out",
              }}
            />

            {/* ===============================================
                ANTERIOR
                =============================================== */}

            {images.length > 1 && (
              <button
                type="button"
                onClick={previousImage}
                className="
                  absolute
                  left-2
                  top-1/2
                  z-20
                  flex
                  size-11
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  bg-black/45
                  text-white
                  shadow-xl
                  backdrop-blur-md
                  transition
                  hover:bg-black/70

                  sm:left-4
                  sm:size-12
                "
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="size-6" />
              </button>
            )}

            {/* ===============================================
                PRÓXIMA
                =============================================== */}

            {images.length > 1 && (
              <button
                type="button"
                onClick={nextImage}
                className="
                  absolute
                  right-2
                  top-1/2
                  z-20
                  flex
                  size-11
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  bg-black/45
                  text-white
                  shadow-xl
                  backdrop-blur-md
                  transition
                  hover:bg-black/70

                  sm:right-4
                  sm:size-12
                "
                aria-label="Próxima imagem"
              >
                <ChevronRight className="size-6" />
              </button>
            )}

            {/* ===============================================
                INSTRUÇÃO MOBILE
                =============================================== */}

            {zoom === 1 && (
              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-3
                  left-1/2
                  z-10
                  -translate-x-1/2
                  whitespace-nowrap
                  rounded-full
                  bg-black/45
                  px-3
                  py-1.5
                  text-[11px]
                  text-white/65
                  backdrop-blur-md
                  sm:hidden
                "
              >
                Deslize • Duplo toque • Pinça
              </div>
            )}
          </div>

          {/* =================================================
              MINIATURAS
              ================================================= */}

          {images.length > 1 && (
            <div
              className="
                shrink-0
                border-t
                border-white/10
                bg-black/85
                px-3
                py-3
                backdrop-blur-xl
              "
            >
              <div
                className="
                  flex
                  gap-2
                  overflow-x-auto
                  overscroll-x-contain
                  pb-1
                "
              >
                {images.map(
                  (
                    image,
                    index,
                  ) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => {
                        setActiveIndex(
                          index,
                        );

                        resetTransform();
                      }}
                      className={`
                        shrink-0
                        overflow-hidden
                        rounded-lg
                        border-2
                        transition-all

                        ${
                          index ===
                          activeIndex
                            ? "scale-105 border-white opacity-100"
                            : "border-transparent opacity-45 hover:opacity-100"
                        }
                      `}
                      aria-label={`Selecionar imagem ${index + 1}`}
                    >
                      <img onError={(e) => { e.currentTarget.style.display = 'none'; }} src={image.url}
                        alt=""
                        draggable={false}
                        className="
                          size-14
                          object-cover
                          sm:size-16
                        "
                      />
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}