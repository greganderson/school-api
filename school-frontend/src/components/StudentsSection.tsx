import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFastAPI, type Student, type CreateStudentRequest } from '../api/school'
import { createGrade, type CreateGradeRequest } from '../api/grades'
import Modal from './Modal'

const api = getFastAPI()

export default function StudentsSection() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [enrolling, setEnrolling] = useState<Student | null>(null)
  const [grading, setGrading] = useState<Student | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: api.getStudentsStudentsGet,
  })

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: api.getCoursesCoursesGet,
  })

  const createMutation = useMutation({
    mutationFn: (req: CreateStudentRequest) => api.createStudentStudentsPost(req),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); setShowAdd(false) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateStudentRequest }) =>
      api.updateStudentStudentsStudentIdPatch(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); setEditing(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteStudentStudentsStudentIdDelete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  })

  const enrollMutation = useMutation({
    mutationFn: ({ studentId, courseId }: { studentId: number; courseId: number }) =>
      api.addStudentToCourseStudentsStudentIdPost(studentId, { course_id: courseId }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['student-courses', vars.studentId] })
      setEnrolling(null)
    },
  })

  const gradeMutation = useMutation({
    mutationFn: ({ courseId, data }: { courseId: number; data: CreateGradeRequest }) =>
      createGrade(courseId, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['students'] })
      qc.invalidateQueries({ queryKey: ['student-courses', vars.data.student_id] })
      setGrading(null)
    },
  })

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    createMutation.mutate({
      first_name: fd.get('first_name') as string,
      last_name: fd.get('last_name') as string,
      email: fd.get('email') as string,
    })
  }

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editing?.student_id) return
    const fd = new FormData(e.currentTarget)
    updateMutation.mutate({
      id: editing.student_id,
      data: {
        first_name: fd.get('first_name') as string,
        last_name: fd.get('last_name') as string,
        email: fd.get('email') as string,
      },
    })
  }

  const handleEnroll = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!enrolling?.student_id) return
    const fd = new FormData(e.currentTarget)
    enrollMutation.mutate({
      studentId: enrolling.student_id,
      courseId: Number(fd.get('course_id')),
    })
  }

  const handleGrade = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!grading?.student_id) return
    const fd = new FormData(e.currentTarget)
    const courseId = Number(fd.get('course_id'))
    const final_grade = (fd.get('final_grade') as string).trim()
    const score = Number(fd.get('score'))

    gradeMutation.mutate({
      courseId,
      data: {
        student_id: grading.student_id,
        course_id: courseId,
        final_grade,
        components: [
          {
            category: 'Final',
            score,
            weight: 100,
          },
        ],
      },
    })
  }

  const toggleExpand = (id: number) => setExpandedId(expandedId === id ? null : id)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2
            className="text-[26px] sm:text-[36px] font-semibold text-[#111111] dark:text-white transition-colors"
            style={{ letterSpacing: '-1px', lineHeight: '1.15', fontFamily: "'Inter', sans-serif" }}
          >
            Students
          </h2>
          <p className="mt-1 text-[14px] text-[#6b7280] dark:text-[#a1a1aa] transition-colors">
            {students.length} enrolled student{students.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="hidden sm:flex h-10 items-center gap-2 rounded-lg bg-[#111111] dark:bg-white px-5 text-[14px] font-semibold text-white dark:text-[#111111] transition-colors hover:bg-[#242424] dark:hover:bg-[#e5e7eb]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Add Student
        </button>
      </div>

      {/* Floating Action Button — Mobile only */}
      <button
        onClick={() => setShowAdd(true)}
        className="sm:hidden fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] shadow-lg active:scale-95 transition-all"
        style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.25)' }}
        aria-label="Add Student"
      >
        <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>

      {isLoading ? (
        <LoadingSkeleton />
      ) : students.length === 0 ? (
        <EmptyState label="No students yet" />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-[#e5e7eb] dark:border-[#27272a] transition-colors">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-[#e5e7eb] dark:border-[#27272a] bg-[#f8f9fa] dark:bg-[#18181b] transition-colors">
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>ID</Th>
                  <Th right>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <>
                    <tr
                      key={s.student_id}
                      className="border-b border-[#f3f4f6] dark:border-[#1c1c1e] transition-colors hover:bg-[#fafafa] dark:hover:bg-[#121212]/50"
                    >
                      <td className="px-5 py-3.5 text-[14px] font-medium text-[#111111] dark:text-white transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar name={`${s.first_name} ${s.last_name}`} />
                          {s.first_name} {s.last_name}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[14px] text-[#374151] dark:text-[#d4d4d8] transition-colors">{s.email}</td>
                      <td className="px-5 py-3.5 text-[14px] text-[#6b7280] dark:text-[#a1a1aa] transition-colors">#{s.student_id}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <ActionBtn onClick={() => toggleExpand(s.student_id!)} label="Courses" icon="courses" />
                          <ActionBtn onClick={() => setEnrolling(s)} label="Enroll" icon="enroll" />
                          <ActionBtn onClick={() => setGrading(s)} label="Grade" icon="grade" />
                          <ActionBtn onClick={() => setEditing(s)} label="Edit" icon="edit" />
                          <ActionBtn
                            onClick={() => { if (confirm('Delete this student?')) deleteMutation.mutate(s.student_id!) }}
                            label="Delete"
                            icon="delete"
                            danger
                          />
                        </div>
                      </td>
                    </tr>
                    {expandedId === s.student_id && (
                      <CoursesRow key={`courses-${s.student_id}`} studentId={s.student_id!} />
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-4">
            {students.map((s) => (
              <div
                key={s.student_id}
                className="rounded-xl border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#121212] p-4 transition-all"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={`${s.first_name} ${s.last_name}`} />
                    <div>
                      <h3 className="text-[15px] font-semibold text-[#111111] dark:text-white transition-colors">
                        {s.first_name} {s.last_name}
                      </h3>
                      <p className="text-[12px] text-[#6b7280] dark:text-[#a1a1aa] transition-colors">#{s.student_id}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-[12px] text-[#6b7280] dark:text-[#a1a1aa] block mb-0.5 transition-colors">Email</span>
                  <span className="text-[14px] text-[#374151] dark:text-[#d4d4d8] font-medium break-all transition-colors">{s.email}</span>
                </div>

                {expandedId === s.student_id && (
                  <div className="mb-4 border-t border-[#f3f4f6] dark:border-[#1c1c1e] pt-3">
                    <span className="text-[12px] text-[#6b7280] dark:text-[#a1a1aa] block mb-2 font-medium transition-colors">Enrolled Courses</span>
                    <CoursesRowMobile studentId={s.student_id!} />
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-[#f3f4f6] dark:border-[#1c1c1e] pt-3">
                  <button
                    onClick={() => toggleExpand(s.student_id!)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-[#6b7280] dark:text-[#a1a1aa] transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#1c1c1e] hover:text-[#111111] dark:hover:text-white"
                  >
                    <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
                      <path d="M2 3h9M2 6.5h9M2 10h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    {expandedId === s.student_id ? 'Hide Courses' : 'Courses'}
                  </button>
                  <div className="flex items-center gap-1.5">
                    <ActionBtnMobile onClick={() => setEnrolling(s)} label="Enroll" icon="enroll" />
                    <ActionBtnMobile onClick={() => setGrading(s)} label="Grade" icon="grade" />
                    <ActionBtnMobile onClick={() => setEditing(s)} label="Edit" icon="edit" />
                    <ActionBtnMobile
                      onClick={() => { if (confirm('Delete this student?')) deleteMutation.mutate(s.student_id!) }}
                      label="Delete"
                      icon="delete"
                      danger
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showAdd && (
        <Modal title="Add Student" onClose={() => setShowAdd(false)}>
          <PersonForm onSubmit={handleAdd} loading={createMutation.isPending} submitLabel="Add Student" />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Student" onClose={() => setEditing(null)}>
          <PersonForm
            onSubmit={handleEdit}
            loading={updateMutation.isPending}
            submitLabel="Save Changes"
            defaultValues={editing}
          />
        </Modal>
      )}

      {grading && (
        <Modal title={`Assign Grade to ${grading.first_name}`} onClose={() => setGrading(null)}>
          <form onSubmit={handleGrade} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#374151] dark:text-[#d4d4d8]">Course</label>
              <select
                name="course_id"
                required
                className="h-11 sm:h-10 w-full rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#1c1c1e] px-3.5 text-[14px] text-[#111111] dark:text-white focus:border-[#111111] dark:focus:border-white focus:outline-none transition-colors"
              >
                <option value="">Select a course…</option>
                {courses.map((c) => (
                  <option key={c.course_id} value={c.course_id!}>
                    {c.course_number} — {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#374151] dark:text-[#d4d4d8]">Final Grade</label>
                <input
                  name="final_grade"
                  type="text"
                  placeholder="A, B+, 92"
                  required
                  className="h-11 sm:h-10 w-full rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#1c1c1e] px-3.5 text-[14px] text-[#111111] dark:text-white focus:border-[#111111] dark:focus:border-white focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#374151] dark:text-[#d4d4d8]">Score</label>
                <input
                  name="score"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="100"
                  required
                  className="h-11 sm:h-10 w-full rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#1c1c1e] px-3.5 text-[14px] text-[#111111] dark:text-white focus:border-[#111111] dark:focus:border-white focus:outline-none transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={gradeMutation.isPending}
              className="flex h-11 sm:h-10 w-full items-center justify-center rounded-lg bg-[#111111] dark:bg-white text-[14px] font-semibold text-white dark:text-[#111111] disabled:bg-[#e5e7eb] dark:disabled:bg-[#27272a] disabled:text-[#6b7280] dark:disabled:text-[#71717a] transition-colors hover:bg-[#242424] dark:hover:bg-[#e5e7eb]"
            >
              {gradeMutation.isPending ? 'Saving Grade…' : 'Save Grade'}
            </button>
          </form>
        </Modal>
      )}

      {enrolling && (
        <Modal title={`Enroll ${enrolling.first_name}`} onClose={() => setEnrolling(null)}>
          <form onSubmit={handleEnroll} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#374151] dark:text-[#d4d4d8]">Course</label>
              <select
                name="course_id"
                required
                className="h-11 sm:h-10 w-full rounded-lg border border-[#e5e7eb] dark:border-[#27272a] bg-white dark:bg-[#1c1c1e] px-3.5 text-[14px] text-[#111111] dark:text-white focus:border-[#111111] dark:focus:border-white focus:outline-none transition-colors"
              >
                <option value="">Select a course…</option>
                {courses.map((c) => (
                  <option key={c.course_id} value={c.course_id!}>
                    {c.course_number} — {c.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={enrollMutation.isPending}
              className="flex h-11 sm:h-10 w-full items-center justify-center rounded-lg bg-[#111111] dark:bg-white text-[14px] font-semibold text-white dark:text-[#111111] disabled:bg-[#e5e7eb] dark:disabled:bg-[#27272a] disabled:text-[#6b7280] dark:disabled:text-[#71717a] transition-colors hover:bg-[#242424] dark:hover:bg-[#e5e7eb]"
            >
              {enrollMutation.isPending ? 'Enrolling…' : 'Enroll'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}

function CoursesRow({ studentId }: { studentId: number }) {
  const api = getFastAPI()
  const { data, isLoading } = useQuery({
    queryKey: ['student-courses', studentId],
    queryFn: () => api.getStudentCoursesStudentsStudentIdCoursesGet(studentId),
  })

  return (
    <tr className="bg-[#f8f9fa] dark:bg-[#18181b] transition-colors">
      <td colSpan={4} className="px-5 py-3">
        {isLoading ? (
          <span className="text-[13px] text-[#6b7280] dark:text-[#a1a1aa]">Loading courses…</span>
        ) : !data || Object.keys(data).length === 0 ? (
          <span className="text-[13px] text-[#6b7280] dark:text-[#a1a1aa]">Not enrolled in any courses.</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {Object.entries(data).map(([num, title]) => (
              <span
                key={num}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] dark:bg-[#1c1c1e] px-3 py-1 text-[13px] font-medium text-[#111111] dark:text-white border border-[#e5e7eb] dark:border-[#27272a] transition-colors"
              >
                <span className="font-semibold">{num}</span>
                <span className="text-[#6b7280] dark:text-[#a1a1aa]">{title}</span>
              </span>
            ))}
          </div>
        )}
      </td>
    </tr>
  )
}

function PersonForm({
  onSubmit,
  loading,
  submitLabel,
  defaultValues,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  loading: boolean
  submitLabel: string
  defaultValues?: { first_name: string; last_name: string; email: string }
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First Name" name="first_name" placeholder="Jane" defaultValue={defaultValues?.first_name} required />
        <Field label="Last Name" name="last_name" placeholder="Smith" defaultValue={defaultValues?.last_name} required />
      </div>
      <Field label="Email" name="email" type="email" placeholder="jane@example.com" defaultValue={defaultValues?.email} required />
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
    <th
      className={`px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#6b7280] dark:text-[#a1a1aa] ${right ? 'text-right' : 'text-left'}`}
    >
      {children}
    </th>
  )
}

const PASTEL = ['#fde68a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#fed7aa']
function Avatar({ name }: { name: string }) {
  const idx = name.charCodeAt(0) % PASTEL.length
  return (
    <span
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-[#111111]"
      style={{ backgroundColor: PASTEL[idx] }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
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
    grade: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2v10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    edit: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 9.5L4 7 9.5 1.5a1.414 1.414 0 012 2L6 9l-4 1.5-.5-1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    delete: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2.5h3v1M4 3.5l.5 7h4l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    courses: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 3h9M2 6.5h9M2 10h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    enroll: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  }
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
        danger
          ? 'text-[#ef4444] hover:bg-[#fef2f2] dark:hover:bg-[#ef4444]/10'
          : 'text-[#6b7280] dark:text-[#a1a1aa] hover:bg-[#f5f5f5] dark:hover:bg-[#27272a] hover:text-[#111111] dark:hover:text-white'
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
        <div key={i} className="h-12 animate-pulse bg-[#f5f5f5] dark:bg-[#1c1c1e]" />
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

function CoursesRowMobile({ studentId }: { studentId: number }) {
  const api = getFastAPI()
  const { data, isLoading } = useQuery({
    queryKey: ['student-courses', studentId],
    queryFn: () => api.getStudentCoursesStudentsStudentIdCoursesGet(studentId),
  })

  if (isLoading) return <span className="text-[13px] text-[#6b7280] dark:text-[#a1a1aa]">Loading courses…</span>
  if (!data || Object.keys(data).length === 0) return <span className="text-[13px] text-[#6b7280] dark:text-[#a1a1aa]">Not enrolled in any courses.</span>

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(data).map(([num, title]) => (
        <span
          key={num}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] dark:bg-[#1c1c1e] px-3 py-1 text-[13px] font-medium text-[#111111] dark:text-white border border-[#e5e7eb] dark:border-[#27272a] transition-colors"
        >
          <span className="font-semibold">{num}</span>
          <span className="text-[#6b7280] dark:text-[#a1a1aa]">{title}</span>
        </span>
      ))}
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
    grade: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2v10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    edit: <svg width="14" height="14" viewBox="0 0 13 13" fill="none"><path d="M1.5 9.5L4 7 9.5 1.5a1.414 1.414 0 012 2L6 9l-4 1.5-.5-1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    delete: <svg width="14" height="14" viewBox="0 0 13 13" fill="none"><path d="M2 3.5h9M5 3.5V2.5h3v1M4 3.5l.5 7h4l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    courses: <svg width="14" height="14" viewBox="0 0 13 13" fill="none"><path d="M2 3h9M2 6.5h9M2 10h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    enroll: <svg width="14" height="14" viewBox="0 0 13 13" fill="none"><path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
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
