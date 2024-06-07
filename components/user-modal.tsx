/* eslint-disable prettier/prettier */
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import {
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import React, { useEffect } from "react";

type Props = {
  onJoin: (value: string) => void;
  wsOpen?: boolean;
};

type JoinForm = {
  userName: {
    value: string;
  };
};
export default function UserModal({ onJoin, wsOpen }: Props) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    if (!wsOpen) return;
    onOpen();
  }, [wsOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = e.target as unknown as JoinForm;

    onJoin(body.userName.value);
  };

  return (
    <>
      <Modal
        hideCloseButton
        isDismissable={false}
        isOpen={isOpen}
        placement="center"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <form method="POST" onSubmit={handleSubmit}>
                <ModalHeader className="flex flex-col gap-1">
                  Welcome to Chit Chat
                </ModalHeader>
                <ModalBody>
                  <Input
                    maxLength={20}
                    name="userName"
                    placeholder="Enter your name"
                    variant="bordered"
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" type="submit" onPress={onClose}>
                    Join Chat
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
