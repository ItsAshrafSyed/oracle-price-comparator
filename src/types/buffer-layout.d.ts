declare module "buffer-layout" {
	export function struct(fields: any[]): any
	export function u64(property: string): any
	export function u8(property?: string): any
	export function blob(length: number, property?: string): any
}
