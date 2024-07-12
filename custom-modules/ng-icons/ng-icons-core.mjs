import * as i0 from '@angular/core';
import { InjectionToken, inject, Optional, SkipSelf, Injector, ElementRef, runInInjectionContext, Component, ChangeDetectionStrategy, Input, HostBinding, NgModule, Inject } from '@angular/core';
import { isObservable, firstValueFrom } from 'rxjs7';

const NgIconConfigToken = new InjectionToken('Ng Icon Config');
const defaultConfig = {
    size: '1em',
};
/**
 * Provide the configuration for the icons
 * @param config The configuration to use
 */
function provideNgIconsConfig(config) {
    return {
        provide: NgIconConfigToken,
        useValue: { ...defaultConfig, ...config },
    };
}
/**
 * Inject the configuration for the icons
 * @returns The configuration to use
 * @internal
 */
function injectNgIconConfig() {
    return inject(NgIconConfigToken, { optional: true }) ?? defaultConfig;
}

const NgIconLoaderToken = new InjectionToken('Ng Icon Loader Token');
/**
 * Helper function to create an object that represents a Loader feature.
 */
function loaderFeature(kind, providers) {
    return { kind: kind, providers: providers };
}
const NgIconCacheToken = new InjectionToken('Ng Icon Cache Token');
/**
 * Add caching to the loader. This will prevent the loader from being called multiple times for the same icon name.
 */
function withCaching() {
    return loaderFeature(0 /* NgIconLoaderFeatureKind.CachingFeature */, [
        { provide: NgIconCacheToken, useValue: new Map() },
    ]);
}
/**
 * Provide a function that will return the SVG content for a given icon name.
 * @param loader The function that will return the SVG content for a given icon name.
 * @param features The list of features to apply to the loader.
 * @returns The SVG content for a given icon name.
 */
function provideNgIconLoader(loader, ...features) {
    return [
        { provide: NgIconLoaderToken, useValue: loader },
        features.map(feature => feature.providers),
    ];
}
/**
 * Inject the function that will return the SVG content for a given icon name.
 */
function injectNgIconLoader() {
    return inject(NgIconLoaderToken, { optional: true });
}
/**
 * Inject the cache that will store the SVG content for a given icon name.
 */
function injectNgIconLoaderCache() {
    return inject(NgIconCacheToken, { optional: true });
}

/**
 * Define the icons to use
 * @param icons The icons to provide
 */
function provideIcons(icons) {
    return [
        {
            provide: NgIconsToken,
            useFactory: (parentIcons) => ({
                ...parentIcons?.reduce((acc, icons) => ({ ...acc, ...icons }), {}),
                ...icons,
            }),
            deps: [[NgIconsToken, new Optional(), new SkipSelf()]],
            multi: true,
        },
    ];
}
const NgIconsToken = new InjectionToken('Icons Token');
/**
 * Inject the icons to use
 * @returns The icons to use
 * @internal
 */
function injectNgIcons() {
    return inject(NgIconsToken, { optional: true }) ?? [];
}

/**
 * A loader may return a promise, an observable or a string. This function will coerce the result into a promise.
 * @returns
 */
function coerceLoaderResult(result) {
    if (typeof result === 'string') {
        return Promise.resolve(result);
    }
    if (isObservable(result)) {
        return firstValueFrom(result);
    }
    return result;
}

/**
 * Hyphenated to lowerCamelCase
 */
function toPropertyName(str) {
    return str
        .replace(/([^a-zA-Z0-9])+(.)?/g, (_, __, chr) => chr ? chr.toUpperCase() : '')
        .replace(/[^a-zA-Z\d]/g, '')
        .replace(/^([A-Z])/, m => m.toLowerCase());
}

class NgIcon {
    constructor() {
        /** Access the global icon config */
        this.config = injectNgIconConfig();
        /** Access the icons */
        this.icons = injectNgIcons();
        /** Access the icon loader if defined */
        this.loader = injectNgIconLoader();
        /** Access the icon loader cache if defined */
        this.cache = injectNgIconLoaderCache();
        /** Access the injector */
        this.injector = inject(Injector);
        /** Access the element ref */
        this.elementRef = inject(ElementRef);
        this._size = this.config.size;
        /** Define the color of the icon */
        this.color = this.config.color;
    }
    /** Define the name of the icon to display */
    set name(name) {
        this.setIcon(name);
    }
    /** Define the size of the icon */
    set size(size) {
        // if the size only contains numbers, assume it is in pixels
        this._size = coerceCssPixelValue(size);
    }
    get size() {
        return this._size;
    }
    /**
     * Load the icon with the given name and insert it into the template.
     * @param name The name of the icon to load.
     */
    async setIcon(name) {
        const propertyName = toPropertyName(name);
        for (const icons of [...this.icons].reverse()) {
            if (icons[propertyName]) {
                // insert the SVG into the template
                this.elementRef.nativeElement.innerHTML = icons[propertyName];
                return;
            }
        }
        // if we have a cache check if the icon is already loaded
        if (this.cache?.has(name)) {
            this.elementRef.nativeElement.innerHTML = this.cache.get(name);
            return;
        }
        // if there is a loader defined, use it to load the icon
        if (this.loader) {
            const result = await this.requestIconFromLoader(name);
            // if the result is a string, insert the SVG into the template
            if (result !== null) {
                // if we have a cache, store the result
                this.cache?.set(name, result);
                this.elementRef.nativeElement.innerHTML = result;
                return;
            }
        }
        // if there is no icon with this name warn the user as they probably forgot to import it
        console.warn(`No icon named ${name} was found. You may need to import it using the withIcons function.`);
    }
    /**
     * Request the icon from the loader.
     * @param name The name of the icon to load.
     * @returns The SVG content for a given icon name.
     */
    requestIconFromLoader(name) {
        return new Promise(resolve => {
            runInInjectionContext(this.injector, async () => {
                const result = await coerceLoaderResult(this.loader(name));
                resolve(result);
            });
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.5", ngImport: i0, type: NgIcon, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "16.2.5", type: NgIcon, isStandalone: true, selector: "ng-icon", inputs: { name: "name", size: "size", strokeWidth: "strokeWidth", color: "color" }, host: { properties: { "style.--ng-icon__size": "this.size", "style.--ng-icon__stroke-width": "this.strokeWidth", "style.color": "this.color" } }, ngImport: i0, template: '', isInline: true, styles: [":host{display:inline-block;width:var(--ng-icon__size);height:var(--ng-icon__size)}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.5", ngImport: i0, type: NgIcon, decorators: [{
            type: Component,
            args: [{ selector: 'ng-icon', template: '', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, styles: [":host{display:inline-block;width:var(--ng-icon__size);height:var(--ng-icon__size)}\n"] }]
        }], propDecorators: { name: [{
                type: Input
            }], size: [{
                type: HostBinding,
                args: ['style.--ng-icon__size']
            }, {
                type: Input
            }], strokeWidth: [{
                type: HostBinding,
                args: ['style.--ng-icon__stroke-width']
            }, {
                type: Input
            }], color: [{
                type: HostBinding,
                args: ['style.color']
            }, {
                type: Input
            }] } });
function coerceCssPixelValue(value) {
    return value == null ? '' : /^\d+$/.test(value) ? `${value}px` : value;
}

class NgIconsModule {
    constructor(icons) {
        if (Object.keys(icons).length === 0) {
            throw new Error('No icons have been provided. Ensure to include some icons by importing them using NgIconsModule.withIcons({ ... }).');
        }
    }
    /**
     * Define the icons that will be included in the application. This allows unused icons to
     * be tree-shaken away to reduce bundle size
     * @param icons The object containing the required icons
     */
    static withIcons(icons) {
        return { ngModule: NgIconsModule, providers: provideIcons(icons) };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.2.5", ngImport: i0, type: NgIconsModule, deps: [{ token: NgIconsToken }], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "16.2.5", ngImport: i0, type: NgIconsModule, imports: [NgIcon], exports: [NgIcon] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "16.2.5", ngImport: i0, type: NgIconsModule }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.2.5", ngImport: i0, type: NgIconsModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [NgIcon],
                    exports: [NgIcon],
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [NgIconsToken]
                }] }]; } });
const NG_ICON_DIRECTIVES = [NgIcon];

/**
 * Generated bundle index. Do not edit.
 */

export { NG_ICON_DIRECTIVES, NgIcon, NgIconCacheToken, NgIcon as NgIconComponent, NgIconConfigToken, NgIconLoaderToken, NgIconsModule, NgIconsToken, injectNgIconConfig, injectNgIconLoader, injectNgIconLoaderCache, injectNgIcons, provideIcons, provideNgIconLoader, provideNgIconsConfig, withCaching };
//# sourceMappingURL=ng-icons-core.mjs.map
