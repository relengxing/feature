'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/react'
import { MoreVertical, Edit, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface IdeaActionsProps {
  ideaId: string
}

export function IdeaActions({ ideaId }: IdeaActionsProps) {
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    const supabase = createClient()

    const { error } = await supabase.schema('feature').from('ideas').delete().eq('id', ideaId)

    if (error) {
      alert('删除失败: ' + error.message)
      setDeleting(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly variant="light" size="sm">
            <MoreVertical size={18} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="想法操作">
          <DropdownItem
            key="edit"
            startContent={<Edit size={16} />}
            onClick={() => router.push(`/ideas/${ideaId}/edit`)}
          >
            编辑
          </DropdownItem>
          <DropdownItem
            key="delete"
            color="danger"
            className="text-danger"
            startContent={<Trash2 size={16} />}
            onClick={onOpen}
          >
            删除
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>确认删除</ModalHeader>
          <ModalBody>
            <p>确定要删除这个想法吗？此操作无法撤销。</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              取消
            </Button>
            <Button color="danger" onPress={handleDelete} isLoading={deleting}>
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

