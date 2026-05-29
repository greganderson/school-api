import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFastAPI, type Course, type CreateCourseRequest } from '../api/school'
import Modal from './Modal'

const api = getFastAPI()

export default function CoursesSection() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: api.getCoursesCoursesGet,
  })

  const { data: instructors = [] } = useQuery({
    queryKey: ['instructors'],
    queryFn: api.getInstructorsInstructorsGet,
  })

  const createMutation = useMutation({
    mutationFn: (req: CreateCourseRequest) => api.createCourseCoursesPost(req),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); setShowAdd(false) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateCourseRequest> }) =>
      api.updateCourseCoursesIdPatch(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); setEditing(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteCourseCourseCourseIdDelete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  })

  const instructorName = (id: number) => {
    const inst = instructors.find((i) => i.id === id)
    return inst ? `${inst.first_name} ${inst.last_name}` : `#${id}`
  }

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    createMutation.mutate({
      instructor_id: Number(fd.get('instructor_id')),
      title: fd.get('title') as string,
      course_number: fd.get('course_number') as string,
      credits: Number(fd.get('credits')),
    })
  }

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editing?.course_id) return
    const fd = new FormData(e.currentTarget)
    updateMutation.mutate({
      id: editing.course_id,
      data: {
        instructor_id: Number(fd.get('instructor_id')),
        title: fd.get('title') as string,
        course_number: fd.get('course_number') as string,
        credits: Number(fd.get('credits')),
      },
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2
            className="text-[26px] sm:text-[36px] font-semibold text-[#111111] dark:text-white transition-colors"
            style={{ letterSpacing: '-1px', lineHeight: '1.15', fontFamily: "'Inter', sans-serif" }}
          >
            Courses
          </h2>
          <p className="mt-1 text-[14px] text-[#6b7280] dark:text-[#a1a1aa] transition-colors">
            {courses.length} course{courses.length !== 1 ? 's' : ''} offered
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="hidden sm:flex h-10 items-center gap-2 rounded-lg bg-[#111111] dark:bg-white px-5 text-[14px] font-semibold text-white dark:text-[#111111] transition-colors hover:bg-[#242424] dark:hover:bg-[#e5e7eb]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Add Course
        </button>
      </div>

      {/* Floating Action Button — Mobile only */}
      <button
        onClick={() => setShowAdd(true)}
        className="sm:hidden fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] shadow-lg active:scale-95 transition-all"
        style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}
        aria-label="Add Course"
      >
        <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>

      {isLoading ? (
        <LoadingSkeleton />
      ) : courses.length === 0 ? (
        <EmptyState label="No courses yet" />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-[#e5e7eb] dark:border-[#27272a] transition-colors">
            <table className="w-full min-w-[580px]">
              <thead>
                <tr className="border-b border-[#e5e7eb] dark:border-[#27272a] bg-[#f8f9fa] dark:bg-[#18181b] transition-colors">
                  <Th>Course</Th>
                  <Th>Title</Th>
                  <Th>Instructor</Th>
                  <Th>Credits</Th>
                  <Th right>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr
                    key={c.course_id}
                    className="border-b border-[#f3f4f6] dark:border-[#1c1c1e] transition-colors hover:bg-[#fafafa] dark:hover:bg-[#121212]/50"
                  >
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold text-[#111111]"
                        style={{ backgroundColor: courseColor(c.course_number), letterSpacing: '0.02em' }}
                      >
                        {c.course_number}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[14px] font-medium text-[#111111] dark:text-white transition-colors">{c.title}</td>
                    <td className="px-5 py-3.5 text-[14px] text-[#374151] dark:text-[#d4d4d8] transition-colors">{instructorName(c.instructor_id)}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f5] dark:bg-[#1c1c1e] px-2.5 py-0.5 text-[12px] font-medium text-[#374151] dark:text-[#d4d4d8] border border-[#e5e7eb] dark:border-[#27272a] transition-colors"
                      >
                        {c.credits} cr
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <ActionBtn onClick={() => setEditing(c)} label="Edit" icon="edit" />
                        <ActionBtn
                          onClick={() => { if (confirm('Delete this course?')) deleteMutation.mutate(c.course_id!) }}
                          label="Delete"
                          icon="delete"
                          danger
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-4">
            {courses.map((c) => (
              <div
                key={c.course_id}
                className="rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#121212] p-4 transition-all"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold text-[#111111]"
                    style={{ backgroundColor: courseColor(c.course_number), letterSpacing: '0.02em' }}
                  >
                    {c.course_number}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f5] px-2.5 py-0.5 text-[12px] font-medium text-[#374151]"
                    style={{ border: '1px solid #e5e7eb' }}
                  >
                    {c.credits} cr
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="text-[16px] font-semibold text-[#111111] dark:text-white transition-colors mb-1">
                    {c.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[13px] text-[#6b7280]">
                    <span>Instructor:</span>
                    <span className="font-medium text-[#374151] dark:text-[#d4d4d8] transition-colors">{instructorName(c.instructor_id)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-[#f3f4f6] dark:border-[#1c1c1e] pt-3">
                  <ActionBtnMobile onClick={() => setEditing(c)} label="Edit" icon="edit" />
                  <ActionBtnMobile
                    onClick={() => { if (confirm('Delete this course?')) deleteMutation.mutate(c.course_id!) }}
                    label="Delete"
                    icon="delete"
                    danger
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showAdd && (
        <Modal title="Add Course" onClose={() => setShowAdd(false)}>
          <CourseForm
            onSubmit={handleAdd}
            loading={createMutation.isPending}
            submitLabel="Add Course"
            instructors={instructors}
          />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Course" onClose={() => setEditing(null)}>
          <CourseForm
            onSubmit={handleEdit}
            loading={updateMutation.isPending}
            submitLabel="Save Changes"
            instructors={instructors}
            defaultValues={editing}
          />
        </Modal>
      )}
    </div>
  )
}

const DEPT_COLORS: Record<string, string> = {
  CS: '#dbeafe',
  MATH: '#dcfce7',
  ENG: '#fef9c3',
  BIO: '#d1fae5',
  PHYS: '#ede9fe',
}
function courseColor(num: string): string {
  const dept = num.replace(/[^A-Z]/g, '')
  return DEPT_COLORS[dept] ?? '#f5f5f5'
}

function CourseForm({
  onSubmit,
  loading,
  submitLabel,
  instructors,
  defaultValues,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  loading: boolean
  submitLabel: string
  instructors: { id?: number | null; first_name: string; last_name: string }[]
  defaultValues?: Course
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Course Number" name="course_number" placeholder="CS 1400" defaultValue={defaultValues?.course_number} required />
        <Field label="Credits" name="credits" type="number" placeholder="3" defaultValue={defaultValues?.credits?.toString()} required />
      </div>
      <Field label="Title" name="title" placeholder="Fundamentals of Programming" defaultValue={defaultValues?.title} required />
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">Instructor</label>
        <select
          name="instructor_id"
          required
          defaultValue={defaultValues?.instructor_id ?? ''}
          className="h-11 sm:h-10 w-full rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#121212] px-3.5 text-[14px] text-[#111111] dark:text-white focus:border-[#111111] dark:focus:border-white focus:outline-none transition-colors"
        >
          <option value="">Select instructor…</option>
          {instructors.map((i) => (
            <option key={i.id} value={i.id!}>
              {i.first_name} {i.last_name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex h-11 sm:h-10 w-full items-center justify-center rounded-lg bg-[#111111] dark:bg-white text-[14px] font-semibold text-white dark:text-[#111111] transition-colors hover:bg-[#242424] dark:hover:bg-[#e5e7eb] disabled:bg-[#e5e7eb] dark:disabled:bg-[#27272a] disabled:text-[#6b7280] dark:disabled:text-[#71717a]"
      >
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  defaultValue,
  required,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  defaultValue?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-[#374151] dark:text-[#d4d4d8]">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="h-11 sm:h-10 w-full rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#121212] px-3.5 text-[14px] text-[#111111] dark:text-white placeholder:text-[#9ca3af] dark:placeholder:text-[#52525b] focus:border-[#111111] dark:focus:border-white focus:outline-none transition-colors"
      />
    </div>
  )
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#a1a1aa] ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}

function ActionBtn({
  onClick,
  label,
  icon,
  danger,
}: {
  onClick: () => void
  label: string
  icon: string
  danger?: boolean
}) {
  const icons: Record<string, React.ReactNode> = {
    edit: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 9.5L4 7 9.5 1.5a1.414 1.414 0 012 2L6 9l-4 1.5-.5-1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    delete: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2.5h3v1M4 3.5l.5 7h4l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  }
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
        danger ? 'text-[#ef4444] hover:bg-[#fef2f2] dark:hover:bg-[#ef4444]/10' : 'text-[#6b7280] dark:text-[#a1a1aa] hover:bg-[#f5f5f5] dark:hover:bg-[#27272a] hover:text-[#111111] dark:hover:text-white'
      }`}
    >
      {icons[icon]}
    </button>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 overflow-hidden rounded-xl border border-[#e5e7eb] dark:border-[#27272a]">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 animate-pulse bg-[#f5f5f5]" />
      ))}
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e5e7eb] dark:border-[#27272a] py-16 text-[#6b7280] dark:text-[#a1a1aa]">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mb-3 opacity-30">
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2"/>
        <path d="M20 12v8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <p className="text-[14px] font-medium">{label}</p>
    </div>
  )
}

function ActionBtnMobile({
  onClick,
  label,
  icon,
  danger,
}: {
  onClick: () => void
  label: string
  icon: string
  danger?: boolean
}) {
  const icons: Record<string, React.ReactNode> = {
    edit: <svg width="14" height="14" viewBox="0 0 13 13" fill="none"><path d="M1.5 9.5L4 7 9.5 1.5a1.414 1.414 0 012 2L6 9l-4 1.5-.5-1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    delete: <svg width="14" height="14" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2.5h3v1M4 3.5l.5 7h4l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  }
  return (
    <button
      onClick={onClick}
      className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-semibold transition-colors ${
        danger
          ? 'bg-[#fef2f2] dark:bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#fee2e2] dark:hover:bg-[#ef4444]/20'
          : 'bg-[#f5f5f5] dark:bg-[#1c1c1e] text-[#374151] dark:text-[#d4d4d8] hover:bg-[#e5e7eb] dark:hover:bg-[#27272a] hover:text-[#111111] dark:hover:text-white'
      }`}
    >
      {icons[icon]}
      <span>{label}</span>
    </button>
  )
}
