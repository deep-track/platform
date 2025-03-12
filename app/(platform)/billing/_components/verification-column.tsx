import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

type Verification = {
type: string;
completed: boolean;
creditCost: number;
createdAt: string;
}

export const verificationColumns: ColumnDef<Verification>[] = [
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }: { row: any }) => {
          const type = row.getValue('type')
          return (
            <Badge variant="outline">
              {type.replace('_', ' ')}
            </Badge>
          )
        }
      },
      {
        accessorKey: 'completed',
        header: 'Completed',
        cell: ({ row }: { row: any }) => {
            const completed = row.getValue('completed')
          return (
            <Badge
        variant={
          completed === true
            ? 'success'
            : completed === false
              ? 'destructive'
              : 'secondary'
        }
      >
        {completed === true
          ? 'Completed'
          : completed === false
            ? 'Failed'
            : 'Pending'}
      </Badge>
          )
        }
      },
      {
        accessorKey: 'creditCost',
        header: 'Credits Used'
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }: { row: any }) => format(new Date(row.getValue('createdAt')), 'MMM dd, yyyy')
      }
]