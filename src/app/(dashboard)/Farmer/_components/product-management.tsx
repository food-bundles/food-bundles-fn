import { Search, Filter, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function ProductManagement() {
  const products = [
    {
      id: "O",
      name: "Organic Apples",
      category: "Fruits",
      quantity: "25 kg",
      submittedDate: "2023-11-15",
      price: "$45.50",
      status: "Pending",
      statusColor: "bg-yellow-100 text-yellow-800",
    },
    {
      id: "F",
      name: "Fresh Carrots",
      category: "Vegetables",
      quantity: "18 kg",
      submittedDate: "2023-11-14",
      price: "$32.75",
      status: "Verified",
      statusColor: "bg-blue-100 text-blue-800",
    },
    {
      id: "H",
      name: "Heirloom Tomatoes",
      category: "Vegetables",
      quantity: "15 kg",
      submittedDate: "2023-11-12",
      price: "$38.25",
      status: "Approved",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: "O",
      name: "Organic Kale",
      category: "Greens",
      quantity: "10 kg",
      submittedDate: "2023-11-10",
      price: "$27.50",
      status: "Paid",
      statusColor: "bg-purple-100 text-purple-800",
    },
    {
      id: "F",
      name: "Free-range Eggs",
      category: "Dairy & Eggs",
      quantity: "30 dozen",
      submittedDate: "2023-11-09",
      price: "$63.00",
      status: "Approved",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: "G",
      name: "Green Onions",
      category: "Vegetables",
      quantity: "8 kg",
      submittedDate: "2023-11-08",
      price: "$12.80",
      status: "Verified",
      statusColor: "bg-blue-100 text-blue-800",
    },
  ]

  return (
    <div className="flex  pl-30">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full max-w-6xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Product Management</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search products..." className="pl-10" />
            </div>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>

        <div className=  "p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Submitted Date</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {product.id}
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{product.category}</TableCell>
                  <TableCell className="text-gray-600">{product.quantity}</TableCell>
                  <TableCell className="text-gray-600">{product.submittedDate}</TableCell>
                  <TableCell className="font-medium">{product.price}</TableCell>
                  <TableCell>
                    <Badge className={product.statusColor}>{product.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Product</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">Showing 1 to 6 of 24 entries</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-green-600 text-white">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
