import type { ReactNode } from "react";
import { Fragment } from "react";
import { Menu } from "@base-ui/react/menu";
import { MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export type ActionMenuItem = {
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  to?: string;
  href?: string;
  destructive?: boolean;
  disabled?: boolean;
};

export function ActionMenu({
  label,
  title,
  children,
  items,
  className,
}: {
  label: string;
  title?: string;
  children?: ReactNode;
  items: ActionMenuItem[];
  className?: string;
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button
            variant="ghost"
            size={children ? "default" : "icon"}
            className={className}
            aria-label={label}
          />
        }
      >
        {children ?? <MoreHorizontal size={19} />}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          sideOffset={6}
          align="end"
          className="action-menu-positioner"
        >
          <Menu.Popup className="action-menu-popup" aria-label={label}>
            <Menu.Group>
              {title && (
                <Menu.GroupLabel className="action-menu-title">
                  {title}
                </Menu.GroupLabel>
              )}
              {items.map((item) => (
                <Fragment key={item.label}>
                  {item.destructive && (
                    <Menu.Separator className="action-menu-separator" />
                  )}
                  <Menu.Item
                    className={`action-menu-item ${item.destructive ? "destructive" : ""}`}
                    label={item.label}
                    disabled={item.disabled}
                    onClick={item.onSelect}
                    render={
                      item.to ? (
                        <Link to={item.to} />
                      ) : item.href ? (
                        <a href={item.href} target="_blank" rel="noreferrer" />
                      ) : undefined
                    }
                  >
                    {item.icon}
                    {item.label}
                  </Menu.Item>
                </Fragment>
              ))}
            </Menu.Group>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
