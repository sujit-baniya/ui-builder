import { FC } from "react"
import { CloseIcon } from "~/packages/components"
import { HeaderProps } from "./interface"
import { closeIconStyle, headerStyle } from "./style"

export const ModalHeader: FC<HeaderProps> = (props) => {
  const { title, handleCloseModal } = props

  return (
    <div css={headerStyle}>
      <span>{title}</span>
      <div css={closeIconStyle} onClick={handleCloseModal}>
        <CloseIcon />
      </div>
    </div>
  )
}
ModalHeader.displayName = "ModalHeader"
