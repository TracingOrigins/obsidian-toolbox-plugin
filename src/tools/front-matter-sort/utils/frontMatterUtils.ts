import {TFile} from 'obsidian';
import {FrontMatterSortTool} from '../core/FrontMatterSortTool';

/**
 * 对文件的 front-matter 进行排序
 * @param this 工具实例
 * @param file 要处理的文件
 */
export async function sortFrontMatter(this: FrontMatterSortTool, file: TFile): Promise<void> {
    try {
        // 获取文件的 front-matter
        const metadata = this.plugin.app.metadataCache.getFileCache(file);
        if (!metadata?.frontmatter) {
            return;
        }

        // 获取属性排序顺序
        const propertyOrder = this.config.propertyOrder.split('\n')
            .map(p => p.trim())
            .filter(p => p);

        // 获取当前的 front-matter 属性
        const currentProperties = Object.keys(metadata.frontmatter);
        
        // 创建新的 front-matter 对象
        const newFrontMatter: Record<string, any> = {};
        
        // 首先添加指定顺序的属性
        for (const property of propertyOrder) {
            if (currentProperties.includes(property)) {
                newFrontMatter[property] = metadata.frontmatter[property];
            }
        }
        
        // 然后添加未在排序列表中指定的属性
        if (this.config.keepUnspecifiedProperties) {
            for (const property of currentProperties) {
                if (!propertyOrder.includes(property)) {
                    newFrontMatter[property] = metadata.frontmatter[property];
                }
            }
        }

        // 使用 Obsidian 的 fileManager 更新 front-matter
        await this.plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
            // 清除所有现有属性
            for (const key of Object.keys(frontmatter)) {
                delete frontmatter[key];
            }
            // 添加排序后的属性
            for (const [key, value] of Object.entries(newFrontMatter)) {
                frontmatter[key] = value;
            }
        });
    } catch (error) {
        console.error(`[${this.id}] 排序 front-matter 时出错:`, error);
        throw error;
    }
} 