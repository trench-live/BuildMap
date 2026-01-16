import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import './NavigationMap.css';

const parseSvgMeta = (svgContent) => {
    if (!svgContent) {
        return { width: 0, height: 0, originX: 0, originY: 0 };
    }

    const fallback = () => {
        const viewBoxMatch = svgContent.match(/viewBox\s*=\s*["']([^"']+)["']/i);
        if (viewBoxMatch) {
            const parts = viewBoxMatch[1].split(/[\s,]+/).map((value) => Number(value));
            if (parts.length >= 4 && parts.every((value) => Number.isFinite(value))) {
                return {
                    originX: parts[0],
                    originY: parts[1],
                    width: parts[2],
                    height: parts[3]
                };
            }
        }

        const widthMatch = svgContent.match(/width\s*=\s*["']([^"']+)["']/i);
        const heightMatch = svgContent.match(/height\s*=\s*["']([^"']+)["']/i);
        const width = widthMatch ? Number.parseFloat(widthMatch[1]) : 0;
        const height = heightMatch ? Number.parseFloat(heightMatch[1]) : 0;

        return {
            originX: 0,
            originY: 0,
            width: Number.isFinite(width) ? width : 0,
            height: Number.isFinite(height) ? height : 0
        };
    };

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        if (!svg) {
            return fallback();
        }

        const viewBox = svg.getAttribute('viewBox');
        if (viewBox) {
            const parts = viewBox.split(/[\s,]+/).map((value) => Number(value));
            if (parts.length >= 4 && parts.every((value) => Number.isFinite(value))) {
                return {
                    originX: parts[0],
                    originY: parts[1],
                    width: parts[2],
                    height: parts[3]
                };
            }
        }

        const width = Number.parseFloat(svg.getAttribute('width'));
        const height = Number.parseFloat(svg.getAttribute('height'));

        return {
            originX: 0,
            originY: 0,
            width: Number.isFinite(width) ? width : 0,
            height: Number.isFinite(height) ? height : 0
        };
    } catch (error) {
        return fallback();
    }
};

const extractSvgBody = (svgContent) => {
    if (!svgContent) return '';
    const match = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    return match ? match[1] : svgContent;
};

const normalizeCoordinate = (value, size) => {
    const numericValue = Number(value);
    const numericSize = Number(size);
    if (!Number.isFinite(numericValue) || !Number.isFinite(numericSize)) return 0;
    if (numericValue >= 0 && numericValue <= 1) {
        return numericValue * numericSize;
    }
    return numericValue;
};

const mapCoordinate = (value, size, origin) => {
    const base = normalizeCoordinate(value, size);
    return origin + base;
};

const NavigationMap = ({
    svgContent,
    fulcrums,
    routePath,
    routeSegments,
    focusFulcrum,
    endFulcrumId,
    focusTargets
}) => {
    const containerRef = useRef(null);
    const transformRef = useRef(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!containerRef.current) return undefined;

        const updateSize = () => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            setContainerSize({ width: rect.width, height: rect.height });
        };

        updateSize();
        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(containerRef.current);
        window.addEventListener('resize', updateSize);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateSize);
        };
    }, []);

    const svgMeta = useMemo(() => parseSvgMeta(svgContent), [svgContent]);
    const svgBody = useMemo(() => extractSvgBody(svgContent), [svgContent]);

    const coordinateWidth = svgMeta.width || 1;
    const coordinateHeight = svgMeta.height || 1;

    const focusPoint = useMemo(() => {
        if (!focusFulcrum) {
            return {
                x: svgMeta.originX + coordinateWidth / 2,
                y: svgMeta.originY + coordinateHeight / 2
            };
        }

        return {
            x: mapCoordinate(focusFulcrum.x, coordinateWidth, svgMeta.originX),
            y: mapCoordinate(focusFulcrum.y, coordinateHeight, svgMeta.originY)
        };
    }, [focusFulcrum, coordinateWidth, coordinateHeight, svgMeta.originX, svgMeta.originY]);

    useEffect(() => {
        if (!containerSize.width || !containerSize.height) return;
        if (!coordinateWidth || !coordinateHeight) return;
        if (!transformRef.current) return;

        const fitScale = Math.min(
            containerSize.width / coordinateWidth,
            containerSize.height / coordinateHeight
        );
        const isNarrow = containerSize.width < 600;
        const boostedScale = fitScale * (isNarrow ? 2.4 : 1.6);
        const minInitialScale = isNarrow ? 1.7 : 0.75;
        const targetScale = Math.max(boostedScale, minInitialScale);

        const positionX = containerSize.width / 2 - focusPoint.x * targetScale;
        const positionY = containerSize.height / 2 - focusPoint.y * targetScale;

        transformRef.current.setTransform(positionX, positionY, targetScale, 0, 'easeOut');
    }, [containerSize.width, containerSize.height, coordinateWidth, coordinateHeight, focusPoint.x, focusPoint.y]);

    useEffect(() => {
        if (!focusTargets || focusTargets.length === 0) return;
        if (!containerSize.width || !containerSize.height) return;
        if (!coordinateWidth || !coordinateHeight) return;
        if (!transformRef.current) return;

        const points = focusTargets
            .map((target) => ({
                x: mapCoordinate(target.x, coordinateWidth, svgMeta.originX),
                y: mapCoordinate(target.y, coordinateHeight, svgMeta.originY)
            }))
            .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

        if (!points.length) return;

        if (points.length === 1) {
            const point = points[0];
            const fitScale = Math.min(
                containerSize.width / coordinateWidth,
                containerSize.height / coordinateHeight
            );
            const targetScale = Math.max(0.9, fitScale * 1.5);

            const positionX = containerSize.width / 2 - point.x * targetScale;
            const positionY = containerSize.height / 2 - point.y * targetScale;

            transformRef.current.setTransform(positionX, positionY, targetScale, 0, 'easeOut');
            return;
        }

        let minX = points[0].x;
        let maxX = points[0].x;
        let minY = points[0].y;
        let maxY = points[0].y;

        points.forEach((point) => {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        });

        const padding = 0.18;
        const boundsWidth = Math.max(maxX - minX, coordinateWidth * 0.02);
        const boundsHeight = Math.max(maxY - minY, coordinateHeight * 0.02);

        const scaleX = containerSize.width / (boundsWidth * (1 + padding * 2));
        const scaleY = containerSize.height / (boundsHeight * (1 + padding * 2));
        const fitScale = Math.min(
            containerSize.width / coordinateWidth,
            containerSize.height / coordinateHeight
        );
        const rawScale = Math.min(scaleX, scaleY);
        const targetScale = Math.max(0.3, Math.min(8, Math.min(rawScale, fitScale * 1.6)));

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        const positionX = containerSize.width / 2 - centerX * targetScale;
        const positionY = containerSize.height / 2 - centerY * targetScale;

        transformRef.current.setTransform(positionX, positionY, targetScale, 0, 'easeOut');
    }, [focusTargets, containerSize.width, containerSize.height, coordinateWidth, coordinateHeight, svgMeta.originX, svgMeta.originY]);

    const segments = useMemo(() => {
        if (routeSegments?.length) {
            return routeSegments;
        }
        if (!routePath || routePath.length < 2) return [];
        const items = [];
        for (let i = 0; i < routePath.length - 1; i += 1) {
            items.push([routePath[i], routePath[i + 1]]);
        }
        return items;
    }, [routePath, routeSegments]);

    return (
        <div className="navigation-canvas" ref={containerRef}>
            <TransformWrapper
                ref={transformRef}
                minScale={0.1}
                maxScale={8}
                centerOnInit={false}
                limitToBounds={false}
                wheel={{ step: 0.1 }}
                pinch={{ step: 5 }}
                panning={{ velocityDisabled: true }}
                doubleClick={{ disabled: true }}
            >
                <TransformComponent wrapperClass="navigation-transform-wrapper" contentClass="navigation-transform-content">
                    <svg
                        className="navigation-svg"
                        viewBox={`${svgMeta.originX} ${svgMeta.originY} ${coordinateWidth} ${coordinateHeight}`}
                        width={coordinateWidth}
                        height={coordinateHeight}
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <g dangerouslySetInnerHTML={{ __html: svgBody }} />
                        {segments.map(([from, to]) => {
                            const fromX = mapCoordinate(from.x, coordinateWidth, svgMeta.originX);
                            const fromY = mapCoordinate(from.y, coordinateHeight, svgMeta.originY);
                            const toX = mapCoordinate(to.x, coordinateWidth, svgMeta.originX);
                            const toY = mapCoordinate(to.y, coordinateHeight, svgMeta.originY);

                            return (
                                <line
                                    key={`${from.id}-${to.id}`}
                                    className="route-line"
                                    x1={fromX}
                                    y1={fromY}
                                    x2={toX}
                                    y2={toY}
                                />
                            );
                        })}
                        {fulcrums.map((fulcrum) => {
                            const isStart = fulcrum.id === focusFulcrum?.id;
                            const isEnd = fulcrum.id === endFulcrumId;
                            const variant = isStart ? 'start' : isEnd ? 'end' : 'path';
                            const adjustedX = mapCoordinate(fulcrum.x, coordinateWidth, svgMeta.originX);
                            const adjustedY = mapCoordinate(fulcrum.y, coordinateHeight, svgMeta.originY);

                            return (
                                <circle
                                    key={fulcrum.id}
                                    className={`fulcrum-marker ${variant}`}
                                    cx={adjustedX}
                                    cy={adjustedY}
                                    r={isStart || isEnd ? 8 : 7}
                                >
                                    <title>{fulcrum.name || `Fulcrum ${fulcrum.id}`}</title>
                                </circle>
                            );
                        })}
                    </svg>
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
};

export default NavigationMap;
