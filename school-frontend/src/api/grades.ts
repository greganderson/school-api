import { customInstance } from './axios-instance'

export interface CreateGradeComponentRequest {
  category: string
  score: number
  weight: number
}

export interface CreateGradeRequest {
  student_id: number
  course_id: number
  final_grade: string
  components: CreateGradeComponentRequest[]
}

export const createGrade = (courseId: number, gradeRequest: CreateGradeRequest) => {
  return customInstance<unknown>({
    url: `/courses/${courseId}/grades`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: gradeRequest,
  })
}
