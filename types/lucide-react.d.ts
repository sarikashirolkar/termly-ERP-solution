import { FC, SVGProps } from 'react'

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
  strokeWidth?: number | string
}

export const Search: FC<IconProps>
export const Filter: FC<IconProps>
export const BookOpen: FC<IconProps>
export const Users: FC<IconProps>
export const GraduationCap: FC<IconProps>
export const Upload: FC<IconProps>
export const Download: FC<IconProps>
export const Trash2: FC<IconProps>
