import React from 'react';

const NavigationSearch = ({
    searchRef,
    searchInputRef,
    searchOpen,
    searchValue,
    searchResults,
    floorLabelMap,
    onSearchChange,
    onSearchFocus,
    onSelectDestination
}) => (
    <div className="navigation-search" ref={searchRef}>
        <input
            type="search"
            className={`navigation-search-input${searchOpen ? ' is-open' : ''}`}
            placeholder="Search destination"
            value={searchValue}
            onChange={onSearchChange}
            onFocus={onSearchFocus}
            ref={searchInputRef}
        />
        {searchOpen && (
            <div className="navigation-search-results is-open">
                {searchResults.length ? (
                    searchResults.map((item) => (
                        <button
                            type="button"
                            key={item.id}
                            className="navigation-search-item"
                            onClick={() => onSelectDestination(item)}
                        >
                            <span className="navigation-search-name">
                                {item.name}
                                <span className="navigation-search-divider"> — </span>
                                <span className="navigation-search-floor">
                                    {floorLabelMap.get(item.floorId) || 'Floor'}
                                </span>
                            </span>
                        </button>
                    ))
                ) : (
                    <div className="navigation-search-empty">No matches</div>
                )}
            </div>
        )}
    </div>
);

export default NavigationSearch;
