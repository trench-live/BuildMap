import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const useFocusState = ({
    route,
    activeFloorId,
    setActiveFloorId,
    stepsOpen,
    stepsRef,
    setSelectedStepKey
}) => {
    const [focusTargets, setFocusTargets] = useState([]);
    const [pendingFocus, setPendingFocus] = useState(null);
    const [focusSegments, setFocusSegments] = useState([]);
    const [focusAnimate, setFocusAnimate] = useState(true);
    const [stepsPanelHeight, setStepsPanelHeight] = useState(0);
    const [lastFocus, setLastFocus] = useState(null);
    const lastAppliedFocusKeyRef = useRef(null);

    const buildFocusKey = (focus) => {
        if (!focus) return null;
        const ids = Array.isArray(focus.targetIds) ? focus.targetIds.join(',') : '';
        const floor = focus.floorId ?? 'x';
        const segCount = Array.isArray(focus.segments) ? focus.segments.length : 0;
        const animate = focus.animate === false ? '0' : '1';
        return `${floor}|${ids}|${segCount}|${animate}`;
    };

    useEffect(() => {
        if (!pendingFocus) return;
        if (pendingFocus.floorId && pendingFocus.floorId !== activeFloorId) {
            setFocusTargets([]);
            setFocusSegments([]);
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
        setFocusSegments(segments);
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

    const onStepClick = useCallback((step) => {
        if (!step) return;
        if (stepsOpen && stepsRef.current) {
            const rect = stepsRef.current.getBoundingClientRect();
            setStepsPanelHeight(rect.height);
        }
        const stepKey = `${step.type}-${step.fromFulcrumId || 'x'}-${step.toFulcrumId || 'y'}`;
        setSelectedStepKey(stepKey);
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
        let segments = [];
        if (!isTurnStep) {
            if (fromIndex >= 0 && toIndex >= 0) {
                const start = Math.min(fromIndex, toIndex);
                const end = Math.max(fromIndex, toIndex);
                for (let i = start; i < end; i += 1) {
                    segments.push([path[i], path[i + 1]]);
                }
            } else {
                const fromItem = path.find((item) => item.id === step.fromFulcrumId);
                const toItem = path.find((item) => item.id === step.toFulcrumId);
                if (fromItem && toItem) {
                    segments = [[fromItem, toItem]];
                }
            }
        }
        const floorId = step.floorId || route?.path?.find((item) => item.id === step.toFulcrumId)?.floorId
            || route?.path?.find((item) => item.id === step.fromFulcrumId)?.floorId;

        if (!targetIds.length) return;
        const animate = floorId ? floorId === activeFloorId : true;
        const focusPayload = { targetIds, floorId, segments, animate };
        setLastFocus(focusPayload);
        if (floorId && floorId !== activeFloorId) {
            setFocusTargets([]);
            setFocusSegments([]);
            setPendingFocus(focusPayload);
            setActiveFloorId(floorId);
        } else {
            setPendingFocus(focusPayload);
        }
    }, [stepsOpen, stepsRef, setSelectedStepKey, route, activeFloorId, setActiveFloorId]);

    const onFloorSelect = useCallback((floorId) => {
        setActiveFloorId(floorId);
        setPendingFocus(null);
        if (lastFocus && lastFocus.floorId !== floorId) {
            setFocusTargets([]);
            setFocusSegments([]);
        }
    }, [lastFocus, setActiveFloorId]);

    return {
        focusTargets,
        focusSegments,
        focusAnimate,
        stepsPanelHeight,
        onStepClick,
        onFloorSelect
    };
};

export default useFocusState;
