import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const useFocusState = ({
    route,
    activeFloorId,
    setActiveFloorId,
    stepsOpen,
    stepsRef,
    setSelectedStepIndex
}) => {
    const [focusTargets, setFocusTargets] = useState([]);
    const [pendingFocus, setPendingFocus] = useState(null);
    const [focusSegments, setFocusSegments] = useState([]);
    const [visitedSegments, setVisitedSegments] = useState([]);
    const [focusAnimate, setFocusAnimate] = useState(true);
    const [stepsPanelHeight, setStepsPanelHeight] = useState(0);
    const [lastFocus, setLastFocus] = useState(null);
    const lastAppliedFocusKeyRef = useRef(null);

    const buildFocusKey = (focus) => {
        if (!focus) return null;
        const ids = Array.isArray(focus.targetIds) ? focus.targetIds.join(',') : '';
        const floor = focus.floorId ?? 'x';
        const segCount = Array.isArray(focus.segments) ? focus.segments.length : 0;
        const visitedCount = Array.isArray(focus.visitedSegments) ? focus.visitedSegments.length : 0;
        const animate = focus.animate === false ? '0' : '1';
        return `${floor}|${ids}|${segCount}|${visitedCount}|${animate}`;
    };

    const buildSegmentsRange = (path, startIndex, endIndex) => {
        if (!Array.isArray(path) || startIndex < 0 || endIndex < startIndex) {
            return [];
        }

        const segments = [];
        for (let index = startIndex; index < endIndex; index += 1) {
            const from = path[index];
            const to = path[index + 1];
            if (from && to) {
                segments.push([from, to]);
            }
        }
        return segments;
    };

    useEffect(() => {
        if (!pendingFocus) return;
        if (pendingFocus.floorId && pendingFocus.floorId !== activeFloorId) {
            setFocusTargets([]);
            setFocusSegments([]);
            setVisitedSegments([]);
            return;
        }
        const targetFloorId = pendingFocus.floorId || activeFloorId;
        const targets = pendingFocus.targetIds
            .map((id) => route?.path?.find((item) => item.id === id))
            .filter((item) => item && (!targetFloorId || item.floorId === targetFloorId));
        setFocusTargets(targets);
        const segments = (pendingFocus.segments || []).filter(
            ([from, to]) => !targetFloorId || (from.floorId === targetFloorId && to.floorId === targetFloorId)
        );
        const visited = (pendingFocus.visitedSegments || []).filter(
            ([from, to]) => !targetFloorId || (from.floorId === targetFloorId && to.floorId === targetFloorId)
        );
        setFocusSegments(segments);
        setVisitedSegments(visited);
        setFocusAnimate(pendingFocus.animate !== false);
        lastAppliedFocusKeyRef.current = buildFocusKey(pendingFocus);
        setPendingFocus(null);
    }, [pendingFocus, activeFloorId, route]);

    useEffect(() => {
        if (!lastFocus || !activeFloorId) return;
        if (lastFocus.floorId !== activeFloorId) {
            lastAppliedFocusKeyRef.current = null;
            return;
        }
        const focusKey = buildFocusKey(lastFocus);
        if (lastAppliedFocusKeyRef.current === focusKey) return;
        setPendingFocus(lastFocus);
    }, [activeFloorId, lastFocus]);

    useEffect(() => {
        if (!activeFloorId) return;
        const mismatch = focusTargets.some((item) => item.floorId !== activeFloorId);
        if (mismatch) {
            setFocusTargets([]);
            setFocusSegments([]);
            setVisitedSegments([]);
        }
    }, [activeFloorId, focusTargets]);

    useEffect(() => {
        if (!stepsRef.current) return;
        const updateHeight = () => {
            if (!stepsRef.current) return;
            const rect = stepsRef.current.getBoundingClientRect();
            setStepsPanelHeight(rect.height);
        };
        updateHeight();
        const observer = new ResizeObserver(updateHeight);
        observer.observe(stepsRef.current);
        return () => observer.disconnect();
    }, [stepsOpen, route?.steps?.length, stepsRef]);

    useLayoutEffect(() => {
        if (!stepsOpen || !stepsRef.current) return;
        const rect = stepsRef.current.getBoundingClientRect();
        if (rect.height !== stepsPanelHeight) {
            setStepsPanelHeight(rect.height);
        }
    }, [stepsOpen, route?.steps?.length, stepsPanelHeight, stepsRef]);

    useEffect(() => {
        if (!stepsOpen || !lastFocus) return;
        if (!stepsPanelHeight) return;
        setPendingFocus(lastFocus);
    }, [stepsOpen, stepsPanelHeight, lastFocus]);

    const onStepClick = useCallback((step, stepIndex) => {
        if (!step) return;
        if (stepsOpen && stepsRef.current) {
            const rect = stepsRef.current.getBoundingClientRect();
            setStepsPanelHeight(rect.height);
        }
        setSelectedStepIndex(stepIndex);
        const targetIds = [];
        const isTurnStep = ['TURN_LEFT', 'TURN_RIGHT', 'U_TURN'].includes(step.type);
        if (isTurnStep) {
            if (step.fromFulcrumId) targetIds.push(step.fromFulcrumId);
        } else {
            if (step.fromFulcrumId) targetIds.push(step.fromFulcrumId);
            if (step.toFulcrumId && step.toFulcrumId !== step.fromFulcrumId) {
                targetIds.push(step.toFulcrumId);
            }
        }
        const path = route?.path || [];
        const fromIndex = path.findIndex((item) => item.id === step.fromFulcrumId);
        const toIndex = path.findIndex((item) => item.id === step.toFulcrumId);
        const normalizedStartIndex = fromIndex >= 0 && toIndex >= 0 ? Math.min(fromIndex, toIndex) : -1;
        const normalizedEndIndex = fromIndex >= 0 && toIndex >= 0 ? Math.max(fromIndex, toIndex) : -1;
        let segments = [];
        if (!isTurnStep) {
            if (normalizedStartIndex >= 0 && normalizedEndIndex >= 0) {
                segments = buildSegmentsRange(path, normalizedStartIndex, normalizedEndIndex);
            } else {
                const fromItem = path.find((item) => item.id === step.fromFulcrumId);
                const toItem = path.find((item) => item.id === step.toFulcrumId);
                if (fromItem && toItem) {
                    segments = [[fromItem, toItem]];
                }
            }
        }
        const visitedEndIndex = isTurnStep ? fromIndex : normalizedEndIndex;
        const prefixSegments = visitedEndIndex >= 0
            ? buildSegmentsRange(path, 0, visitedEndIndex)
            : [];
        const floorId = step.floorId || route?.path?.find((item) => item.id === step.toFulcrumId)?.floorId
            || route?.path?.find((item) => item.id === step.fromFulcrumId)?.floorId;

        if (!targetIds.length) return;
        const animate = floorId ? floorId === activeFloorId : true;
        const focusPayload = {
            targetIds,
            floorId,
            segments,
            visitedSegments: prefixSegments,
            animate
        };
        setLastFocus(focusPayload);
        if (floorId && floorId !== activeFloorId) {
            setFocusTargets([]);
            setFocusSegments([]);
            setVisitedSegments([]);
            setPendingFocus(focusPayload);
            setActiveFloorId(floorId);
        } else {
            setPendingFocus(focusPayload);
        }
    }, [stepsOpen, stepsRef, setSelectedStepIndex, route, activeFloorId, setActiveFloorId]);

    const onFloorSelect = useCallback((floorId) => {
        setActiveFloorId(floorId);
        setPendingFocus(null);
        if (lastFocus && lastFocus.floorId !== floorId) {
            setFocusTargets([]);
            setFocusSegments([]);
            setVisitedSegments([]);
        }
    }, [lastFocus, setActiveFloorId]);

    return {
        focusTargets,
        focusSegments,
        visitedSegments,
        focusAnimate,
        stepsPanelHeight,
        onStepClick,
        onFloorSelect
    };
};

export default useFocusState;
