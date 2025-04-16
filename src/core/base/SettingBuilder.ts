import {Setting} from 'obsidian';
import {Tool} from '../types/types';
import {FileSuggest} from '../../components/FileSuggest';
import ToolboxPlugin from "../../main";

/**
 * 设置控件创建器接口
 * 定义了创建设置控件的基本方法
 */
interface SettingControlCreator {
    /**
     * 创建设置控件的方法
     * @param setting 设置项实例
     * @param settingConfig 设置配置
     * @param initialValue 初始值
     */
    create(setting: Setting, settingConfig: SettingConfig, initialValue: any): void;
}

/**
 * 设置构建器接口
 * 定义了设置构建器的基本功能
 */
export interface ISettingBuilder {
    /**
     * 更新设置值
     * @param settingConfig 设置配置
     * @param value 新值
     * @returns 更新是否成功
     */
    updateSettingValue(settingConfig: SettingConfig, value: any): Promise<boolean>;
    
    /**
     * 更新依赖设置
     * @param settingName 设置项名称
     */
    updateDependentSettings(settingName: string): void;
    
    /**
     * 获取配置
     * @returns 当前配置
     */
    getConfig(): any;
    
    /**
     * 获取插件实例
     * @returns 插件实例
     */
    getPlugin(): ToolboxPlugin;
    
    /**
     * 获取工具ID
     * @returns 工具ID
     */
    getToolId(): string;
}

/**
 * 文本控件创建器
 * 用于创建文本输入框类型的设置控件
 */
class TextControlCreator implements SettingControlCreator {
    /**
     * 构造函数
     * @param settingBuilder 设置构建器实例
     */
    constructor(private settingBuilder: ISettingBuilder) {}

    /**
     * 创建文本控件
     * @param setting 设置项实例
     * @param settingConfig 设置配置
     * @param initialValue 初始值
     */
    create(setting: Setting, settingConfig: SettingConfig, initialValue: any): void {
        setting.addText(text => {
            const plugin = this.settingBuilder.getPlugin();
            const toolId = this.settingBuilder.getToolId();
            const config = this.settingBuilder.getConfig();
            
            // 应用样式
            if (settingConfig.style) {
                this.applyStyles(text.inputEl, settingConfig.style);
            }
            
            // 应用布局
            if (settingConfig.layout) {
                this.applyLayout(text.inputEl, settingConfig.layout);
            }
            
            // 处理子设置的情况
            if (settingConfig.isSubSetting === true) {
                const tool = plugin.toolManager.getTool(toolId);
                if (tool) {
                    // 检查工具是否启用
                    const toolEnabled = tool.config.enabled;
                    
                    // 获取子设置的值 - 无论工具是否启用，都显示保存的值
                    let savedValue = tool.config[settingConfig.name];
                    // 如果没有保存的值，使用默认值
                    if (savedValue === undefined) {
                        savedValue = settingConfig.value;
                    }
                    
                    // 设置文本框的值
                    text.setValue(savedValue);
                    
                    // 当文本框值变化时
                    text.onChange(async (value) => {
                        // 无论工具是否启用，都保存子设置值
                        // 保存子设置值
                        tool.config[settingConfig.name] = value;
                        await tool.saveSettings();
                    });
                }
            } else {
                // 普通设置的处理
            // 设置初始值
                text.setValue(config[settingConfig.name] ?? settingConfig.value);
            
            // 设置占位符
            if (settingConfig.placeholder) {
                text.setPlaceholder(settingConfig.placeholder);
            }
            
            // 添加图标
            if (settingConfig.icon) {
                this.addIcon(text.inputEl, settingConfig.icon);
            }
            
            // 添加工具提示
            if (settingConfig.tooltip) {
                this.addTooltip(text.inputEl, settingConfig.tooltip);
            }
            
            // 设置无障碍属性
            if (settingConfig.accessibility) {
                this.setAccessibility(text.inputEl, settingConfig.accessibility);
            }
            
            // 设置高级选项
            if (settingConfig.advanced) {
                this.setAdvancedOptions(setting, settingConfig.advanced);
            }
            
            // 设置行为
            if (settingConfig.behavior) {
                this.setupBehavior(text.inputEl, settingConfig, setting);
            } else {
                // 默认行为
                text.onChange(async (value) => {
                    await this.settingBuilder.updateSettingValue(settingConfig, value);
                    this.settingBuilder.updateDependentSettings(settingConfig.name);
                });
                }
            }
        });
    }
    
    /**
     * 应用样式
     * @param element HTML元素
     * @param style 样式配置
     */
    private applyStyles(element: HTMLElement, style: SettingConfig['style']): void {
        if (!style) return;
        
        if (style.width) element.style.width = style.width;
        if (style.height) element.style.height = style.height;
        if (style.fontSize) element.style.fontSize = style.fontSize;
        if (style.color) element.style.color = style.color;
        if (style.backgroundColor) element.style.backgroundColor = style.backgroundColor;
        if (style.borderColor) element.style.borderColor = style.borderColor;
        if (style.borderRadius) element.style.borderRadius = style.borderRadius;
        if (style.padding) element.style.padding = style.padding;
        if (style.margin) element.style.margin = style.margin;
        if (style.customClass) element.addClass(style.customClass);
    }
    
    /**
     * 应用布局
     * @param element HTML元素
     * @param layout 布局配置
     */
    private applyLayout(element: HTMLElement, layout: SettingConfig['layout']): void {
        if (!layout) return;
        
        if (layout.display) element.style.display = layout.display;
        if (layout.flexDirection) element.style.flexDirection = layout.flexDirection;
        if (layout.alignItems) element.style.alignItems = layout.alignItems;
        if (layout.justifyContent) element.style.justifyContent = layout.justifyContent;
        if (layout.wrap !== undefined) element.style.flexWrap = layout.wrap ? 'wrap' : 'nowrap';
    }
    
    /**
     * 添加图标
     * @param element HTML元素
     * @param icon 图标配置
     */
    private addIcon(element: HTMLElement, icon: SettingConfig['icon']): void {
        if (!icon) return;
        
        const iconEl = document.createElement('span');
        iconEl.addClass('setting-icon');
        iconEl.addClass(`icon-${icon.name}`);
        if (icon.size) iconEl.style.fontSize = icon.size;
        
        if (icon.position === 'left') {
            element.parentElement?.insertBefore(iconEl, element);
        } else {
            element.parentElement?.appendChild(iconEl);
        }
    }
    
    /**
     * 添加工具提示
     * @param element HTML元素
     * @param tooltip 工具提示配置
     */
    private addTooltip(element: HTMLElement, tooltip: SettingConfig['tooltip']): void {
        if (!tooltip) return;
        
        element.setAttribute('title', tooltip.text);
        element.setAttribute('data-tooltip-position', tooltip.position || 'top');
        
        if (tooltip.delay) {
            element.setAttribute('data-tooltip-delay', tooltip.delay.toString());
        }
    }
    
    /**
     * 设置无障碍属性
     * @param element HTML元素
     * @param accessibility 无障碍配置
     */
    private setAccessibility(element: HTMLElement, accessibility: SettingConfig['accessibility']): void {
        if (!accessibility) return;
        
        if (accessibility.ariaLabel) element.setAttribute('aria-label', accessibility.ariaLabel);
        if (accessibility.ariaDescribedBy) element.setAttribute('aria-describedby', accessibility.ariaDescribedBy);
        if (accessibility.tabIndex !== undefined) element.setAttribute('tabindex', accessibility.tabIndex.toString());
        if (accessibility.keyboardShortcut) element.setAttribute('data-shortcut', accessibility.keyboardShortcut);
    }
    
    /**
     * 设置高级选项
     * @param setting 设置项实例
     * @param advanced 高级选项配置
     */
    private setAdvancedOptions(setting: Setting, advanced: SettingConfig['advanced']): void {
        if (!advanced) return;
        
        if (advanced.isAdvanced) {
            setting.setClass('advanced-setting');
        }
        
        if (advanced.requiresRestart) {
            const restartNote = setting.descEl.createDiv('restart-note');
            restartNote.setText('需要重启应用才能生效');
        }
        
        if (advanced.experimental) {
            const experimentalBadge = setting.nameEl.createSpan('experimental-badge');
            experimentalBadge.setText('实验性');
        }
    }
    
    /**
     * 设置行为
     * @param element HTML元素
     * @param settingConfig 设置配置
     * @param setting 设置项实例
     */
    private setupBehavior(element: HTMLElement, settingConfig: SettingConfig, setting: Setting): void {
        const behavior = settingConfig.behavior;
        if (!behavior) return;
        
        let onChangeHandler = async (value: any) => {
            await this.settingBuilder.updateSettingValue(settingConfig, value);
            this.settingBuilder.updateDependentSettings(settingConfig.name);
            
            if (behavior.onChange) {
                await Promise.resolve(behavior.onChange(value));
            }
        };
        
        // 应用防抖
        if (behavior.debounce) {
            let timeout: NodeJS.Timeout;
            const originalHandler = onChangeHandler;
            onChangeHandler = async (value: any) => {
                clearTimeout(timeout);
                return new Promise<void>((resolve) => {
                    timeout = setTimeout(async () => {
                        await originalHandler(value);
                        resolve();
                    }, behavior.debounce);
                });
            };
        }
        
        // 应用节流
        if (behavior.throttle !== undefined) {
            let lastCall = 0;
            const originalHandler = onChangeHandler;
            onChangeHandler = async (value: any) => {
                const now = Date.now();
                if (now - lastCall >= behavior.throttle!) {
                    lastCall = now;
                    await originalHandler(value);
                }
            };
        }
        
        // 设置事件监听器
        element.addEventListener('input', (e) => {
            const value = (e.target as HTMLInputElement).value;
            
            if (behavior.confirmOnChange) {
                const confirmed = confirm(behavior.confirmMessage || '确认更改此设置？');
                if (confirmed) {
                    onChangeHandler(value);
                }
            } else {
                onChangeHandler(value);
            }
        });
        
        // 焦点事件
        if (behavior.onFocus) {
            element.addEventListener('focus', behavior.onFocus);
        }
        
        if (behavior.onBlur) {
            element.addEventListener('blur', behavior.onBlur);
        }
    }
}

/**
 * 开关控件创建器
 * 用于创建开关类型的设置控件
 */
class ToggleControlCreator implements SettingControlCreator {
    /**
     * 构造函数
     * @param settingBuilder 设置构建器实例
     */
    constructor(private settingBuilder: ISettingBuilder) {}

    /**
     * 创建开关控件
     * @param setting 设置项实例
     * @param settingConfig 设置配置
     * @param initialValue 初始值
     */
    create(setting: Setting, settingConfig: SettingConfig, initialValue: any): void {
        setting.addToggle(toggle => {
            const plugin = this.settingBuilder.getPlugin();
            const toolId = this.settingBuilder.getToolId();
            const tool = plugin.toolManager.getTool(toolId);
            
            if (tool) {
                // 检查工具是否启用
                const toolEnabled = tool.config.enabled;
                // 获取设置状态 - 无论工具是否启用，都显示保存的状态
                const settingState = (tool.config as Record<string, any>)[settingConfig.name] ?? false;
                
                // 设置开关状态为保存的状态
                toggle.setValue(settingState);
                
                // 不再禁用控件，但添加视觉提示，表明工具当前禁用

            toggle.onChange(async (value) => {
                    // 无论工具是否启用，都保存设置值
                    if (value) {
                        plugin.toolManager.enableSubSetting(toolId, settingConfig.name);
                    } else {
                        plugin.toolManager.disableSubSetting(toolId, settingConfig.name);
                    }
                });
            }
        });
    }
}

/**
 * 下拉菜单控件创建器
 * 用于创建下拉菜单类型的设置控件
 */
class DropdownControlCreator implements SettingControlCreator {
    /**
     * 构造函数
     * @param settingBuilder 设置构建器实例
     */
    constructor(private settingBuilder: ISettingBuilder) {}

    /**
     * 创建下拉菜单控件
     * @param setting 设置项实例
     * @param settingConfig 设置配置
     * @param initialValue 初始值
     */
    create(setting: Setting, settingConfig: SettingConfig, initialValue: any): void {
        if (settingConfig.options) {
            setting.addDropdown(dropdown => {
                // 添加选项
                Object.entries(settingConfig.options!).forEach(([value, display]) => {
                    dropdown.addOption(value, display);
                });
                
                const plugin = this.settingBuilder.getPlugin();
                const toolId = this.settingBuilder.getToolId();
                const tool = plugin.toolManager.getTool(toolId);
                
                if (tool) {
                    // 检查工具是否启用
                    const toolEnabled = tool.config.enabled;
                    
                    // 获取配置的值 - 无论工具是否启用，都显示保存的值
                    let savedValue = tool.config[settingConfig.name];
                    // 如果没有保存的值，使用默认值
                    if (savedValue === undefined) {
                        savedValue = settingConfig.value;
                    }
                    
                    // 设置下拉菜单的值
                    dropdown.setValue(savedValue);
                    
                    // 当下拉菜单值变化时
                dropdown.onChange(async (value) => {
                        // 无论工具是否启用，都保存值
                        // 保存值
                        tool.config[settingConfig.name] = value;
                        await tool.saveSettings();
                    });
                }
            });
        }
    }
}

/**
 * 滑块控件创建器
 * 用于创建滑块类型的设置控件
 */
class SliderControlCreator implements SettingControlCreator {
    /**
     * 构造函数
     * @param settingBuilder 设置构建器实例
     */
    constructor(private settingBuilder: ISettingBuilder) {}

    /**
     * 创建滑块控件
     * @param setting 设置项实例
     * @param settingConfig 设置配置
     * @param initialValue 初始值
     */
    create(setting: Setting, settingConfig: SettingConfig, initialValue: any): void {
        setting.addSlider(slider => {
            if (settingConfig.min !== undefined) {
                slider.setLimits(settingConfig.min, settingConfig.max || 100, settingConfig.step || 1);
            }
            
            const plugin = this.settingBuilder.getPlugin();
            const toolId = this.settingBuilder.getToolId();
            const config = this.settingBuilder.getConfig();
            
            // 处理子设置的情况
            if (settingConfig.isSubSetting === true) {
                const tool = plugin.toolManager.getTool(toolId);
                if (tool) {
                    // 检查工具是否启用
                    const toolEnabled = tool.config.enabled;
                    
                    // 获取子设置的值 - 无论工具是否启用，都显示保存的值
                    let savedValue = tool.config[settingConfig.name];
                    // 如果没有保存的值，使用默认值
                    if (savedValue === undefined) {
                        savedValue = settingConfig.value;
                    }
                    
                    // 设置滑块的值
                    slider.setValue(savedValue);
                    
                    // 当滑块值变化时
                    slider.onChange(async (value) => {
                        // 无论工具是否启用，都保存子设置值
                        // 保存子设置值
                        tool.config[settingConfig.name] = value;
                        await tool.saveSettings();
                    });
                }
            } else {
                // 普通设置的处理
                slider.setValue(config[settingConfig.name] || settingConfig.value);
            slider.onChange(async (value) => {
                await this.settingBuilder.updateSettingValue(settingConfig, value);
                this.settingBuilder.updateDependentSettings(settingConfig.name);
            });
            }
        });
    }
}

/**
 * 颜色控件创建器
 * 用于创建颜色选择器类型的设置控件
 */
class ColorControlCreator implements SettingControlCreator {
    /**
     * 构造函数
     * @param settingBuilder 设置构建器实例
     */
    constructor(private settingBuilder: ISettingBuilder) {}

    /**
     * 创建颜色控件
     * @param setting 设置项实例
     * @param settingConfig 设置配置
     * @param initialValue 初始值
     */
    create(setting: Setting, settingConfig: SettingConfig, initialValue: any): void {
        setting.addColorPicker(colorPicker => {
            const plugin = this.settingBuilder.getPlugin();
            const toolId = this.settingBuilder.getToolId();
            const config = this.settingBuilder.getConfig();
            
            // 处理子设置的情况
            if (settingConfig.isSubSetting === true) {
                const tool = plugin.toolManager.getTool(toolId);
                if (tool) {
                    // 检查工具是否启用
                    const toolEnabled = tool.config.enabled;
                    
                    // 获取子设置的值 - 无论工具是否启用，都显示保存的值
                    let savedValue = tool.config[settingConfig.name];
                    // 如果没有保存的值，使用默认值
                    if (savedValue === undefined) {
                        savedValue = settingConfig.value;
                    }
                    
                    // 设置颜色选择器的值
                    colorPicker.setValue(savedValue);
                    
                    // 如果工具被禁用，禁用此颜色选择器
                    if (!toolEnabled) {
                        colorPicker.setDisabled(true);
                    }
                    
                    // 当颜色选择器值变化时
                    colorPicker.onChange(async (value) => {
                        // 只有工具启用时才能修改子设置的值
                        if (toolEnabled) {
                            // 保存子设置值
                            tool.config[settingConfig.name] = value;
                            await tool.saveSettings();
                        }
                    });
                }
            } else {
                // 普通设置的处理
                colorPicker.setValue(config[settingConfig.name] || settingConfig.value);
            colorPicker.onChange(async (value) => {
                await this.settingBuilder.updateSettingValue(settingConfig, value);
                this.settingBuilder.updateDependentSettings(settingConfig.name);
            });
            }
        });
    }
}

/**
 * 文件控件创建器
 * 用于创建文件选择器类型的设置控件
 */
class FileControlCreator implements SettingControlCreator {
    constructor(private settingBuilder: ISettingBuilder) {}

    /**
     * 创建文件控件
     * @param setting 设置项实例
     * @param settingConfig 设置配置
     * @param initialValue 初始值
     */
    create(setting: Setting, settingConfig: SettingConfig, initialValue: any): void {
        setting.addText(text => {
            const plugin = this.settingBuilder.getPlugin();
            const toolId = this.settingBuilder.getToolId();
            const config = this.settingBuilder.getConfig();
            
            // 处理子设置的情况
            if (settingConfig.isSubSetting === true) {
                const tool = plugin.toolManager.getTool(toolId);
                if (tool) {
                    // 检查工具是否启用
                    const toolEnabled = tool.config.enabled;
                    
                    // 获取子设置的值 - 无论工具是否启用，都显示保存的值
                    let savedValue = tool.config[settingConfig.name];
                    // 如果没有保存的值，使用默认值
                    if (savedValue === undefined) {
                        savedValue = settingConfig.value;
                    }
                    
                    // 设置文本框的值
                    text.setValue(savedValue);
                    
                    // 添加文件建议功能
                    new FileSuggest(plugin.app, text.inputEl, settingConfig.fileTypes);
                    
                    // 如果工具被禁用，禁用此文本框
                    if (!toolEnabled) {
                        text.setDisabled(true);
                        text.inputEl.addClass('disabled-input');
                    }
                    
                    // 当文本框值变化时
                    text.onChange(async (value) => {
                        // 只有工具启用时才能修改子设置的值
                        if (toolEnabled) {
                            // 保存子设置值
                            tool.config[settingConfig.name] = value;
                            await tool.saveSettings();
                        }
                    });
                }
            } else {
                // 普通设置的处理
                text.setValue(config[settingConfig.name] || settingConfig.value);
                new FileSuggest(plugin.app, text.inputEl, settingConfig.fileTypes);
            text.onChange(async (value) => {
                await this.settingBuilder.updateSettingValue(settingConfig, value);
                this.settingBuilder.updateDependentSettings(settingConfig.name);
            });
            }
        });
    }
}

/**
 * 日期控件创建器
 * 用于创建日期选择器类型的设置控件
 */
class DateControlCreator implements SettingControlCreator {
    constructor(private settingBuilder: ISettingBuilder) {}

    /**
     * 创建日期控件
     * @param setting 设置项实例
     * @param settingConfig 设置配置
     * @param initialValue 初始值
     */
    create(setting: Setting, settingConfig: SettingConfig, initialValue: any): void {
        setting.addText(text => {
            const plugin = this.settingBuilder.getPlugin();
            const toolId = this.settingBuilder.getToolId();
            const config = this.settingBuilder.getConfig();
            
            // 设置输入类型为日期
            text.inputEl.type = 'date';
            text.setPlaceholder(settingConfig.placeholder || 'YYYY-MM-DD');
            
            // 处理子设置的情况
            if (settingConfig.isSubSetting === true) {
                const tool = plugin.toolManager.getTool(toolId);
                if (tool) {
                    // 检查工具是否启用
                    const toolEnabled = tool.config.enabled;
                    
                    // 获取子设置的值 - 无论工具是否启用，都显示保存的值
                    let savedValue = tool.config[settingConfig.name];
                    // 如果没有保存的值，使用默认值
                    if (savedValue === undefined) {
                        savedValue = settingConfig.value;
                    }
                    
                    // 设置日期选择器的值
                    text.setValue(savedValue);
                    
                    // 如果工具被禁用，禁用此日期选择器
                    if (!toolEnabled) {
                        text.setDisabled(true);
                        text.inputEl.addClass('disabled-input');
                    }
                    
                    // 当日期选择器值变化时
                    text.onChange(async (value) => {
                        // 只有工具启用时才能修改子设置的值
                        if (toolEnabled) {
                            // 保存子设置值
                            tool.config[settingConfig.name] = value;
                            await tool.saveSettings();
                        }
                    });
                }
            } else {
                // 普通设置的处理
                text.setValue(config[settingConfig.name] || settingConfig.value);
            text.onChange(async (value) => {
                await this.settingBuilder.updateSettingValue(settingConfig, value);
                this.settingBuilder.updateDependentSettings(settingConfig.name);
            });
            }
        });
    }
}

/**
 * 时间控件创建器
 * 用于创建时间选择器类型的设置控件
 */
class TimeControlCreator implements SettingControlCreator {
    constructor(private settingBuilder: ISettingBuilder) {}

    /**
     * 创建时间控件
     * @param setting 设置项实例
     * @param settingConfig 设置配置
     * @param initialValue 初始值
     */
    create(setting: Setting, settingConfig: SettingConfig, initialValue: any): void {
        setting.addText(text => {
            const plugin = this.settingBuilder.getPlugin();
            const toolId = this.settingBuilder.getToolId();
            const config = this.settingBuilder.getConfig();
            
            // 设置输入类型为时间
            text.inputEl.type = 'time';
            text.setPlaceholder(settingConfig.placeholder || 'HH:mm');
            
            // 处理子设置的情况
            if (settingConfig.isSubSetting === true) {
                const tool = plugin.toolManager.getTool(toolId);
                if (tool) {
                    // 检查工具是否启用
                    const toolEnabled = tool.config.enabled;
                    
                    // 获取子设置的值 - 无论工具是否启用，都显示保存的值
                    let savedValue = tool.config[settingConfig.name];
                    // 如果没有保存的值，使用默认值
                    if (savedValue === undefined) {
                        savedValue = settingConfig.value;
                    }
                    
                    // 设置时间选择器的值
                    text.setValue(savedValue);
                    
                    // 如果工具被禁用，禁用此时间选择器
                    if (!toolEnabled) {
                        text.setDisabled(true);
                        text.inputEl.addClass('disabled-input');
                    }
                    
                    // 当时间选择器值变化时
                    text.onChange(async (value) => {
                        // 只有工具启用时才能修改子设置的值
                        if (toolEnabled) {
                            // 保存子设置值
                            tool.config[settingConfig.name] = value;
                            await tool.saveSettings();
                        }
                    });
                }
            } else {
                // 普通设置的处理
                text.setValue(config[settingConfig.name] || settingConfig.value);
            text.onChange(async (value) => {
                await this.settingBuilder.updateSettingValue(settingConfig, value);
                this.settingBuilder.updateDependentSettings(settingConfig.name);
            });
            }
        });
    }
}

/**
 * 日期时间控件创建器
 * 用于创建日期时间选择器类型的设置控件
 */
class DateTimeControlCreator implements SettingControlCreator {
    constructor(private settingBuilder: ISettingBuilder) {}

    /**
     * 创建日期时间控件
     * @param setting 设置项实例
     * @param settingConfig 设置配置
     * @param initialValue 初始值
     */
    create(setting: Setting, settingConfig: SettingConfig, initialValue: any): void {
        setting.addText(text => {
            const plugin = this.settingBuilder.getPlugin();
            const toolId = this.settingBuilder.getToolId();
            const config = this.settingBuilder.getConfig();
            
            // 设置输入类型为日期时间
            text.inputEl.type = 'datetime-local';
            text.setPlaceholder(settingConfig.placeholder || 'YYYY-MM-DD HH:mm');
            
            // 处理子设置的情况
            if (settingConfig.isSubSetting === true) {
                const tool = plugin.toolManager.getTool(toolId);
                if (tool) {
                    // 检查工具是否启用
                    const toolEnabled = tool.config.enabled;
                    
                    // 获取子设置的值 - 无论工具是否启用，都显示保存的值
                    let savedValue = tool.config[settingConfig.name];
                    // 如果没有保存的值，使用默认值
                    if (savedValue === undefined) {
                        savedValue = settingConfig.value;
                    }
                    
                    // 设置日期时间选择器的值
                    text.setValue(savedValue);
                    
                    // 如果工具被禁用，禁用此日期时间选择器
                    if (!toolEnabled) {
                        text.setDisabled(true);
                        text.inputEl.addClass('disabled-input');
                    }
                    
                    // 当日期时间选择器值变化时
                    text.onChange(async (value) => {
                        // 只有工具启用时才能修改子设置的值
                        if (toolEnabled) {
                            // 保存子设置值
                            tool.config[settingConfig.name] = value;
                            await tool.saveSettings();
                        }
                    });
                }
            } else {
                // 普通设置的处理
                text.setValue(config[settingConfig.name] || settingConfig.value);
            text.onChange(async (value) => {
                await this.settingBuilder.updateSettingValue(settingConfig, value);
                this.settingBuilder.updateDependentSettings(settingConfig.name);
            });
            }
        });
    }
}

/**
 * 多行文本控件创建器
 * 用于创建多行文本输入框类型的设置控件
 */
class TextareaControlCreator implements SettingControlCreator {
    constructor(private settingBuilder: ISettingBuilder) {}

    /**
     * 创建多行文本控件
     * @param setting 设置项实例
     * @param settingConfig 设置配置
     * @param initialValue 初始值
     */
    create(setting: Setting, settingConfig: SettingConfig, initialValue: any): void {
        setting.addTextArea(textArea => {
            const plugin = this.settingBuilder.getPlugin();
            const toolId = this.settingBuilder.getToolId();
            const config = this.settingBuilder.getConfig();

            // 应用样式
            if (settingConfig.style) {
                this.applyStyles(textArea.inputEl, settingConfig.style);
            }

            // 应用布局
            if (settingConfig.layout) {
                this.applyLayout(textArea.inputEl, settingConfig.layout);
            }

            // 处理子设置的情况
            if (settingConfig.isSubSetting === true) {
                const tool = plugin.toolManager.getTool(toolId);
                if (tool) {
                    // 检查工具是否启用
                    const toolEnabled = tool.config.enabled;
                    
                    // 获取子设置的值 - 无论工具是否启用，都显示保存的值
                    let savedValue = tool.config[settingConfig.name];
                    // 如果没有保存的值，使用默认值
                    if (savedValue === undefined) {
                        savedValue = settingConfig.value;
                    }
                    
                    // 设置文本区域的值
                    textArea.setValue(savedValue);
                    

                    // 当文本区域值变化时
                    textArea.onChange(async (value) => {
                        // 无论工具是否启用，都保存子设置值
                        tool.config[settingConfig.name] = value;
                        await tool.saveSettings();
                    });
                }
            } else {
                // 普通设置的处理
                // 设置初始值
                textArea.setValue(config[settingConfig.name] ?? settingConfig.value);
                
                // 设置行数
                if (settingConfig.rows) {
                    textArea.inputEl.setAttr('rows', settingConfig.rows.toString());
                }
                
                // 设置占位符
                if (settingConfig.placeholder) {
                    textArea.setPlaceholder(settingConfig.placeholder);
                }
                
                // 添加图标
                if (settingConfig.icon) {
                    this.addIcon(textArea.inputEl, settingConfig.icon);
                }
                
                // 添加工具提示
                if (settingConfig.tooltip) {
                    this.addTooltip(textArea.inputEl, settingConfig.tooltip);
                }
                
                // 设置无障碍属性
                if (settingConfig.accessibility) {
                    this.setAccessibility(textArea.inputEl, settingConfig.accessibility);
                }
                
                // 设置高级选项
                if (settingConfig.advanced) {
                    this.setAdvancedOptions(setting, settingConfig.advanced);
                }
                
                // 设置行为
                if (settingConfig.behavior) {
                    this.setupBehavior(textArea.inputEl, settingConfig, setting);
                } else {
                    // 默认行为
                    textArea.onChange(async (value) => {
                        await this.settingBuilder.updateSettingValue(settingConfig, value);
            this.settingBuilder.updateDependentSettings(settingConfig.name);
        });
                }
            }
        });
    }
    
    private applyStyles(element: HTMLElement, style: SettingConfig['style']): void {
        if (!style) return;
        
        if (style.width) element.style.width = style.width;
        if (style.height) element.style.height = style.height;
        if (style.fontSize) element.style.fontSize = style.fontSize;
        if (style.color) element.style.color = style.color;
        if (style.backgroundColor) element.style.backgroundColor = style.backgroundColor;
        if (style.borderColor) element.style.borderColor = style.borderColor;
        if (style.borderRadius) element.style.borderRadius = style.borderRadius;
        if (style.padding) element.style.padding = style.padding;
        if (style.margin) element.style.margin = style.margin;
        if (style.customClass) element.addClass(style.customClass);
    }
    
    private applyLayout(element: HTMLElement, layout: SettingConfig['layout']): void {
        if (!layout) return;
        
        if (layout.display) element.style.display = layout.display;
        if (layout.flexDirection) element.style.flexDirection = layout.flexDirection;
        if (layout.alignItems) element.style.alignItems = layout.alignItems;
        if (layout.justifyContent) element.style.justifyContent = layout.justifyContent;
        if (layout.wrap !== undefined) element.style.flexWrap = layout.wrap ? 'wrap' : 'nowrap';
    }
    
    private addIcon(element: HTMLElement, icon: SettingConfig['icon']): void {
        if (!icon) return;
        
        const iconEl = document.createElement('span');
        iconEl.addClass('setting-icon');
        iconEl.addClass(`icon-${icon.name}`);
        if (icon.size) iconEl.style.fontSize = icon.size;
        
        if (icon.position === 'left') {
            element.parentElement?.insertBefore(iconEl, element);
        } else {
            element.parentElement?.appendChild(iconEl);
        }
    }
    
    private addTooltip(element: HTMLElement, tooltip: SettingConfig['tooltip']): void {
        if (!tooltip) return;
        
        element.setAttribute('title', tooltip.text);
        element.setAttribute('data-tooltip-position', tooltip.position || 'top');
        
        if (tooltip.delay) {
            element.setAttribute('data-tooltip-delay', tooltip.delay.toString());
        }
    }
    
    private setAccessibility(element: HTMLElement, accessibility: SettingConfig['accessibility']): void {
        if (!accessibility) return;
        
        if (accessibility.ariaLabel) element.setAttribute('aria-label', accessibility.ariaLabel);
        if (accessibility.ariaDescribedBy) element.setAttribute('aria-describedby', accessibility.ariaDescribedBy);
        if (accessibility.tabIndex !== undefined) element.setAttribute('tabindex', accessibility.tabIndex.toString());
        if (accessibility.keyboardShortcut) element.setAttribute('data-shortcut', accessibility.keyboardShortcut);
    }
    
    private setAdvancedOptions(setting: Setting, advanced: SettingConfig['advanced']): void {
        if (!advanced) return;
        
        if (advanced.isAdvanced) {
            setting.setClass('advanced-setting');
        }
        
        if (advanced.requiresRestart) {
            const restartNote = setting.descEl.createDiv('restart-note');
            restartNote.setText('需要重启应用才能生效');
        }
        
        if (advanced.experimental) {
            const experimentalBadge = setting.nameEl.createSpan('experimental-badge');
            experimentalBadge.setText('实验性');
        }
    }
    
    private setupBehavior(element: HTMLElement, settingConfig: SettingConfig, setting: Setting): void {
        const behavior = settingConfig.behavior;
        if (!behavior) return;
        
        let onChangeHandler = async (value: any) => {
            await this.settingBuilder.updateSettingValue(settingConfig, value);
            this.settingBuilder.updateDependentSettings(settingConfig.name);
            
            if (behavior.onChange) {
                await Promise.resolve(behavior.onChange(value));
            }
        };
        
        // 应用防抖
        if (behavior.debounce) {
            let timeout: NodeJS.Timeout;
            const originalHandler = onChangeHandler;
            onChangeHandler = async (value: any) => {
                clearTimeout(timeout);
                return new Promise<void>((resolve) => {
                    timeout = setTimeout(async () => {
                        await originalHandler(value);
                        resolve();
                    }, behavior.debounce);
                });
            };
        }
        
        // 应用节流
        if (behavior.throttle !== undefined) {
            let lastCall = 0;
            const originalHandler = onChangeHandler;
            onChangeHandler = async (value: any) => {
                const now = Date.now();
                if (now - lastCall >= behavior.throttle!) {
                    lastCall = now;
                    await originalHandler(value);
                }
            };
        }
        
        // 设置事件监听器
        element.addEventListener('input', (e) => {
            const value = (e.target as HTMLInputElement).value;
            
            if (behavior.confirmOnChange) {
                const confirmed = confirm(behavior.confirmMessage || '确认更改此设置？');
                if (confirmed) {
                    onChangeHandler(value);
                }
            } else {
                onChangeHandler(value);
            }
        });
        
        // 焦点事件
        if (behavior.onFocus) {
            element.addEventListener('focus', behavior.onFocus);
        }
        
        if (behavior.onBlur) {
            element.addEventListener('blur', behavior.onBlur);
        }
    }
}

/**
 * 设置控件工厂
 * 用于创建不同类型的设置控件
 */
class SettingControlFactory {
    /**
     * 控件创建器映射表
     */
    private creators: Map<string, SettingControlCreator> = new Map();

    /**
     * 构造函数
     * @param settingBuilder 设置构建器实例
     */
    constructor(settingBuilder: ISettingBuilder) {
        // 注册所有控件创建器
        this.creators.set('text', new TextControlCreator(settingBuilder));
        this.creators.set('toggle', new ToggleControlCreator(settingBuilder));
        this.creators.set('dropdown', new DropdownControlCreator(settingBuilder));
        this.creators.set('slider', new SliderControlCreator(settingBuilder));
        this.creators.set('color', new ColorControlCreator(settingBuilder));
        this.creators.set('file', new FileControlCreator(settingBuilder));
        this.creators.set('date', new DateControlCreator(settingBuilder));
        this.creators.set('time', new TimeControlCreator(settingBuilder));
        this.creators.set('datetime', new DateTimeControlCreator(settingBuilder));
        this.creators.set('textarea', new TextareaControlCreator(settingBuilder));
    }

    /**
     * 创建设置控件
     * @param setting 设置项实例
     * @param settingConfig 设置配置
     * @param initialValue 初始值
     */
    createControl(setting: Setting, settingConfig: SettingConfig, initialValue: any): void {
        const creator = this.creators.get(settingConfig.type);
        if (creator) {
            creator.create(setting, settingConfig, initialValue);
        }
    }
}

/**
 * 设置配置接口
 * 定义了设置项的基本配置选项
 */
export interface SettingConfig {
    name: string; // 设置项名称
    desc: string; // 设置项描述
    type: 'text' | 'toggle' | 'dropdown' | 'slider' | 'color' | 'file' | 'date' | 'time' | 'datetime' | 'textarea'; // 设置项类型
    value: any; // 默认值
    options?: { [key: string]: string }; // 用于 dropdown 类型的选项
    min?: number; // 用于 slider 类型的最小值
    max?: number; // 用于 slider 类型的最大值
    step?: number; // 用于 slider 类型的步长
    fileTypes?: string[]; // 用于 file 类型，指定允许的文件类型
    group?: string; // 设置项所属的分组
    placeholder?: string; // 用于 text 和 textarea 类型的占位符
    rows?: number; // 用于 textarea 类型的行数
    format?: string; // 用于 date/time/datetime 类型的格式化字符串
    dependsOn?: { // 依赖关系配置
        setting: string; // 依赖的设置项名称
        value: any; // 依赖的值
        operator?: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan'; // 比较操作符
    };
    validation?: { // 验证规则配置
        required?: boolean; // 是否必填
        minLength?: number; // 最小长度（用于文本类型）
        maxLength?: number; // 最大长度（用于文本类型）
        pattern?: string; // 正则表达式模式
        custom?: (value: any) => string | null; // 自定义验证函数，返回错误信息或 null
    };
    isSubSetting?: boolean; // 是否为子设置
    style?: { // 样式自定义
        width?: string; // 控件宽度
        height?: string; // 控件高度
        fontSize?: string; // 字体大小
        color?: string; // 文字颜色
        backgroundColor?: string; // 背景颜色
        borderColor?: string; // 边框颜色
        borderRadius?: string; // 边框圆角
        padding?: string; // 内边距
        margin?: string; // 外边距
        customClass?: string; // 自定义CSS类名
    };
    layout?: { // 布局自定义
        display?: 'block' | 'inline' | 'flex'; // 显示方式
        flexDirection?: 'row' | 'column'; // flex布局方向
        alignItems?: 'flex-start' | 'center' | 'flex-end'; // 垂直对齐
        justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around'; // 水平对齐
        wrap?: boolean; // 是否换行
    };
    behavior?: { // 交互行为自定义
        onChange?: (value: any) => void; // 值变化时的回调函数
        onFocus?: () => void; // 获得焦点时的回调函数
        onBlur?: () => void; // 失去焦点时的回调函数
        debounce?: number; // 防抖时间（毫秒）
        throttle?: number; // 节流时间（毫秒）
        autoSave?: boolean; // 是否自动保存
        confirmOnChange?: boolean; // 是否在值变化时显示确认对话框
        confirmMessage?: string; // 确认对话框消息
    };
    accessibility?: { // 无障碍功能
        ariaLabel?: string; // ARIA标签
        ariaDescribedBy?: string; // ARIA描述
        tabIndex?: number; // Tab键顺序
        keyboardShortcut?: string; // 键盘快捷键
    };
    tooltip?: { // 提示信息
        text: string; // 提示文本
        position?: 'top' | 'right' | 'bottom' | 'left'; // 提示位置
        delay?: number; // 显示延迟（毫秒）
    };
    icon?: { // 图标
        name: string; // 图标名称
        position?: 'left' | 'right'; // 图标位置
        size?: string; // 图标大小
    };
    advanced?: { // 高级选项
        isAdvanced?: boolean; // 是否为高级设置
        requiresRestart?: boolean; // 是否需要重启生效
        experimental?: boolean; // 是否为实验性功能
    };
}

/**
 * 设置组接口
 * 定义了设置组的基本结构
 */
export interface SettingGroup {
    name: string; // 组名称
    desc?: string; // 组描述
    settings: SettingConfig[]; // 组内的设置项
}

/**
 * 设置构建器类
 * 用于构建和管理设置界面
 */
export class SettingBuilder implements ISettingBuilder {
    /**
     * 设置容器元素
     */
    private containerEl: HTMLElement;
    
    /**
     * 插件实例
     */
    private plugin: ToolboxPlugin;
    
    /**
     * 工具ID
     */
    private toolId: string;
    
    /**
     * 配置对象
     */
    private config: any;
    
    /**
     * 存储所有设置项的引用
     */
    private settings: Map<string, Setting> = new Map();
    
    /**
     * 存储错误消息元素
     */
    private errorMessages: Map<string, HTMLElement> = new Map();
    
    /**
     * 设置组列表
     */
    private settingsGroups: SettingGroup[] = [];
    
    /**
     * 控件工厂
     */
    private controlFactory: SettingControlFactory;

    /**
     * 构造函数
     * @param containerEl 设置容器元素
     * @param plugin 插件实例
     * @param toolId 工具ID
     * @param config 配置对象
     */
    constructor(containerEl: HTMLElement, plugin: ToolboxPlugin, toolId: string, config: any) {
        this.containerEl = containerEl;
        this.plugin = plugin;
        this.toolId = toolId;
        this.config = config;
        this.controlFactory = new SettingControlFactory(this);
    }

    /**
     * 更新设置可见性
     * @param settingConfig 设置配置
     */
    private updateSettingVisibility(settingConfig: SettingConfig): void {
        const setting = this.settings.get(settingConfig.name);
        if (!setting) return;

        if (settingConfig.dependsOn) {
            const { setting: dependsOnSetting, value, operator = 'equals' } = settingConfig.dependsOn;
            const dependsOnValue = this.config[dependsOnSetting];
            let shouldShow = false;

            // 根据操作符判断是否显示
            switch (operator) {
                case 'equals':
                    shouldShow = dependsOnValue === value;
                    break;
                case 'notEquals':
                    shouldShow = dependsOnValue !== value;
                    break;
                case 'contains':
                    shouldShow = Array.isArray(dependsOnValue) 
                        ? dependsOnValue.includes(value)
                        : String(dependsOnValue).includes(String(value));
                    break;
                case 'greaterThan':
                    shouldShow = dependsOnValue > value;
                    break;
                case 'lessThan':
                    shouldShow = dependsOnValue < value;
                    break;
            }

            // 更新可见性
            setting.controlEl.style.display = shouldShow ? '' : 'none';
            setting.descEl.style.display = shouldShow ? '' : 'none';
        } else {
            setting.controlEl.style.display = '';
            setting.descEl.style.display = '';
        }
    }

    /**
     * 设置依赖监听器
     * @param settingConfig 设置配置
     */
    private setupDependencyListener(settingConfig: SettingConfig): void {
        if (!settingConfig.dependsOn) return;

        const { setting: dependsOnSetting } = settingConfig.dependsOn;
        const dependsOnSettingEl = this.settings.get(dependsOnSetting);
        
        if (dependsOnSettingEl) {
            // 获取依赖设置项的值变化事件
            const dependsOnControl = dependsOnSettingEl.controlEl.querySelector('select, input, textarea');
            
            if (dependsOnControl) {
                // 添加新的事件监听器
                if (dependsOnControl instanceof HTMLSelectElement) {
                    dependsOnControl.addEventListener('change', () => {
                        // 更新配置
                        this.config[dependsOnSetting] = dependsOnControl.value;
                        // 更新可见性
                        this.updateSettingVisibility(settingConfig);
                    });
                } else if (dependsOnControl instanceof HTMLInputElement) {
                    if (dependsOnControl.type === 'checkbox') {
                        dependsOnControl.addEventListener('change', () => {
                            // 更新配置
                            this.config[dependsOnSetting] = dependsOnControl.checked;
                            // 更新可见性
                            this.updateSettingVisibility(settingConfig);
                        });
                    } else {
                        dependsOnControl.addEventListener('input', () => {
                            // 更新配置
                            this.config[dependsOnSetting] = dependsOnControl.value;
                            // 更新可见性
                            this.updateSettingVisibility(settingConfig);
                        });
                    }
                } else if (dependsOnControl instanceof HTMLTextAreaElement) {
                    dependsOnControl.addEventListener('input', () => {
                        // 更新配置
                        this.config[dependsOnSetting] = dependsOnControl.value;
                        // 更新可见性
                        this.updateSettingVisibility(settingConfig);
                    });
                }
            }
            
            // 初始更新可见性
            this.updateSettingVisibility(settingConfig);
        }
    }

    /**
     * 验证设置
     * @param settingConfig 设置配置
     * @param value 要验证的值
     * @returns 错误信息，如果没有错误则返回null
     */
    private validateSetting(settingConfig: SettingConfig, value: any): string | null {
        if (!settingConfig.validation) return null;

        const { validation } = settingConfig;

        // 必填验证
        if (validation.required && (value === undefined || value === null || value === '')) {
            return '此字段为必填项';
        }

        // 如果值为空且不是必填，则跳过其他验证
        if (value === undefined || value === null || value === '') {
            return null;
        }

        // 文本长度验证
        if (typeof value === 'string') {
            if (validation.minLength !== undefined && value.length < validation.minLength) {
                return `最小长度为 ${validation.minLength} 个字符`;
            }
            if (validation.maxLength !== undefined && value.length > validation.maxLength) {
                return `最大长度为 ${validation.maxLength} 个字符`;
            }
            if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
                return '格式不正确';
            }
        }

        // 数值范围验证
        if (typeof value === 'number') {
            if (validation.minLength !== undefined && value < validation.minLength) {
                return `最小值不能小于 ${validation.minLength}`;
            }
            if (validation.maxLength !== undefined && value > validation.maxLength) {
                return `最大值不能大于 ${validation.maxLength}`;
            }
        }

        // 自定义验证
        if (validation.custom) {
            return validation.custom(value);
        }

        return null;
    }

    /**
     * 显示错误信息
     * @param setting 设置项实例
     * @param errorMessage 错误信息
     */
    private showError(setting: Setting, errorMessage: string): void {
        // 移除旧的错误消息
        this.hideError(setting);

        // 创建新的错误消息元素
        const errorEl = setting.controlEl.createDiv({
            cls: 'setting-item-error',
            text: errorMessage
        });

        // 存储错误消息元素引用
        this.errorMessages.set(setting.nameEl.textContent || '', errorEl);
    }

    /**
     * 隐藏错误信息
     * @param setting 设置项实例
     */
    private hideError(setting: Setting): void {
        const errorEl = this.errorMessages.get(setting.nameEl.textContent || '');
        if (errorEl) {
            errorEl.remove();
            this.errorMessages.delete(setting.nameEl.textContent || '');
        }
    }

    /**
     * 更新设置值
     * @param settingConfig 设置配置
     * @param value 新值
     * @returns 更新是否成功
     */
    public updateSettingValue(settingConfig: SettingConfig, value: any): Promise<boolean> {
        // 验证值
        const errorMessage = this.validateSetting(settingConfig, value);
        const setting = this.settings.get(settingConfig.name);
        
        if (errorMessage) {
            if (setting) {
                this.showError(setting, errorMessage);
            }
            return Promise.resolve(false);
        }

        // 隐藏错误消息
        if (setting) {
            this.hideError(setting);
        }

        // 处理所有配置项作为工具配置处理
        const tool = this.plugin.toolManager.getTool(this.toolId);
        if (tool) {

            // 更新本地工具配置
            tool.config[settingConfig.name] = value;
            
            // 立即更新所有依赖此设置项的设置项的可见性
            this.updateDependentSettings(settingConfig.name);
            
            // 保存工具设置并确保保存到data.json

            // 保存到data.json
            return this.directSaveToDataJson(tool, settingConfig.name, value).then(() => {
                return true;
            }).catch((error: unknown) => {
                return false;
            });
        }

        return Promise.resolve(false);
    }

    /**
     * 直接保存到data.json
     * @param tool 工具实例
     * @param settingName 设置项名称
     * @param value 新值
     */
    private async directSaveToDataJson(tool: Tool, settingName: string, value: any): Promise<void> {
        try {
            // 1. 获取最新的data.json数据
            const savedData = await this.plugin.loadData() || {};

            // 2. 确保工具设置对象存在
            if (!savedData[this.toolId]) {
                savedData[this.toolId] = JSON.parse(JSON.stringify(tool.getDefaultConfig()));
            }
            
            // 3. 更新设置值 - 直接存储到工具配置中
            savedData[this.toolId][settingName] = value;

            // 4. 保存回data.json文件
            await this.plugin.saveData(savedData);

            // 5. 强制重新加载设置，验证保存结果
            const verifyData = await this.plugin.loadData();
            if (!verifyData || !verifyData[this.toolId]) {
                throw new Error('保存验证失败');
            }

            // 6. 同步更新内存中的工具配置
            (tool.config as Record<string, any>)[settingName] = value;
            
            // 7. 通知工具配置已更改
            if (tool.onConfigChange) {
                // 创建一个新的配置对象副本以避免引用问题
                const newConfig = JSON.parse(JSON.stringify(tool.config));
                tool.onConfigChange(newConfig);
            }
            
            // 8. 通知工具管理器更新工具配置
            this.plugin.toolManager.updateToolConfig(this.toolId, tool.config);
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * 更新依赖设置
     * @param settingName 设置项名称
     */
    public updateDependentSettings(settingName: string): void {
        // 遍历所有设置组
        for (const group of this.settingsGroups) {
            // 遍历组内的所有设置项
            for (const settingConfig of group.settings) {
                // 检查是否有依赖关系
                if (settingConfig.dependsOn && settingConfig.dependsOn.setting === settingName) {
                    const setting = this.settings.get(settingConfig.name);
                    if (setting) {
                        const { value, operator = 'equals' } = settingConfig.dependsOn;
                        const dependsOnValue = this.config[settingName];
                        let shouldShow = false;

                        // 根据操作符判断是否显示
                        switch (operator) {
                            case 'equals':
                                shouldShow = dependsOnValue === value;
                                break;
                            case 'notEquals':
                                shouldShow = dependsOnValue !== value;
                                break;
                            case 'contains':
                                shouldShow = Array.isArray(dependsOnValue) 
                                    ? dependsOnValue.includes(value)
                                    : String(dependsOnValue).includes(String(value));
                                break;
                            case 'greaterThan':
                                shouldShow = dependsOnValue > value;
                                break;
                            case 'lessThan':
                                shouldShow = dependsOnValue < value;
                                break;
                        }

                        // 更新可见性
                        setting.controlEl.style.display = shouldShow ? '' : 'none';
                        setting.descEl.style.display = shouldShow ? '' : 'none';
                    }
                }
            }
        }
    }
    
    /**
     * 根据名称查找设置配置
     * @param name 设置项名称
     * @returns 设置配置，如果未找到则返回null
     */
    private findSettingConfigByName(name: string): SettingConfig | null {
        // 在所有设置组中查找设置项配置
        for (const group of this.getAllSettingGroups()) {
            for (const setting of group.settings) {
                if (setting.name === name) {
                    return setting;
                }
            }
        }
        return null;
    }
    
    /**
     * 获取所有设置组
     * @returns 设置组列表
     */
    private getAllSettingGroups(): SettingGroup[] {
        return this.settingsGroups;
    }

    /**
     * 创建设置控件
     * @param setting 设置项实例
     * @param settingConfig 设置配置
     * @param initialValue 初始值
     */
    private createSettingControl(setting: Setting, settingConfig: SettingConfig, initialValue: any): void {
        this.controlFactory.createControl(setting, settingConfig, initialValue);
    }

    /**
     * 添加设置项
     * @param settingConfig 设置配置
     * @returns 创建的设置项实例
     */
    addSetting(settingConfig: SettingConfig): Setting {
        const setting = new Setting(this.containerEl)
            .setName(settingConfig.name)
            .setDesc(settingConfig.desc);

        // 存储设置项引用
        this.settings.set(settingConfig.name, setting);

        // 初始验证
        const initialValue = this.config[settingConfig.name] || settingConfig.value;
        const initialError = this.validateSetting(settingConfig, initialValue);
        if (initialError) {
            this.showError(setting, initialError);
        }

        // 创建设置控件
        this.createSettingControl(setting, settingConfig, initialValue);

        // 设置依赖关系
        this.setupDependencyListener(settingConfig);
        
        // 应用高级选项
        if (settingConfig.advanced) {
            this.setAdvancedOptions(setting, settingConfig.advanced);
        }

        return setting;
    }

    /**
     * 添加设置组
     * @param group 设置组配置
     */
    addSettingsGroup(group: SettingGroup): void {
        this.settingsGroups.push(group);
        // 创建分组标题
        const groupEl = this.containerEl.createDiv('setting-group');
        groupEl.createEl('h3', {text: group.name});
        if (group.desc) {
            groupEl.createEl('p', {text: group.desc, cls: 'setting-item-description'});
        }

        // 创建分组容器
        const groupContainer = groupEl.createDiv('setting-group-container');
        
        // 添加分组内的所有设置项
        group.settings.forEach(settingConfig => {
            const setting = new Setting(groupContainer)
                .setName(settingConfig.name)
                .setDesc(settingConfig.desc);
            
            // 存储设置项引用
            this.settings.set(settingConfig.name, setting);

            // 初始验证
            const initialValue = this.config[settingConfig.name] || settingConfig.value;
            const initialError = this.validateSetting(settingConfig, initialValue);
            if (initialError) {
                this.showError(setting, initialError);
            }

            // 创建设置控件
            this.createSettingControl(setting, settingConfig, initialValue);

            // 设置依赖关系
            this.setupDependencyListener(settingConfig);
        });
    }

    /**
     * 获取配置
     * @returns 当前配置
     */
    public getConfig(): any {
        return this.config;
    }

    /**
     * 获取插件实例
     * @returns 插件实例
     */
    public getPlugin(): ToolboxPlugin {
        return this.plugin;
    }

    /**
     * 获取工具ID
     * @returns 工具ID
     */
    public getToolId(): string {
        return this.toolId;
    }

    /**
     * 设置高级选项
     * @param setting 设置项实例
     * @param advanced 高级选项配置
     */
    private setAdvancedOptions(setting: Setting, advanced: SettingConfig['advanced']): void {
        if (!advanced) return;
        
        if (advanced.isAdvanced) {
            setting.setClass('advanced-setting');
        }
        
        if (advanced.requiresRestart) {
            const restartNote = setting.descEl.createDiv('restart-note');
            restartNote.setText('需要重启应用才能生效');
        }
        
        if (advanced.experimental) {
            const experimentalBadge = setting.nameEl.createSpan('experimental-badge');
            experimentalBadge.setText('实验性');
        }
    }
} 
