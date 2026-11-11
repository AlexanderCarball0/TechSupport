
const STORAGE_KEY = "techsupport_tickets";

let tickets = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const ticketForm = document.getElementById("ticketForm");
const ticketList = document.getElementById("ticketList");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

function saveTickets() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

function showCreateForm() {
    document.getElementById("create").classList.remove("hidden");
    document.getElementById("create").scrollIntoView({
        behavior: "smooth"
    });
}

function hideCreateForm() {
    document.getElementById("create").classList.add("hidden");
}

ticketForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const ticket = {
        id: Date.now(),
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        category: document.getElementById("category").value,
        priority: document.getElementById("priority").value,
        status: "Pending",
        date: new Date().toLocaleDateString()
    };

    if (!ticket.title || !ticket.description) return;

    tickets.unshift(ticket);
    saveTickets();
    ticketForm.reset();
    hideCreateForm();
    renderTickets();
});

function updateStatus(id, newStatus) {
    tickets = tickets.map(ticket =>
        ticket.id === id
            ? { ...ticket, status: newStatus }
            : ticket
    );

    saveTickets();
    renderTickets();
}

function deleteTicket(id) {
    const confirmed = confirm("Are you sure you want to delete this ticket?");

    if (!confirmed) return;

    tickets = tickets.filter(ticket => ticket.id !== id);
    saveTickets();
    renderTickets();
}

function renderTickets() {
    const search = searchInput.value.toLowerCase();
    const filter = statusFilter.value;

    const filtered = tickets.filter(ticket => {
        const matchesSearch =
            ticket.title.toLowerCase().includes(search) ||
            ticket.category.toLowerCase().includes(search);

        const matchesStatus =
            filter === "All" || ticket.status === filter;

        return matchesSearch && matchesStatus;
    });

    ticketList.innerHTML = "";

    document.getElementById("totalTickets").textContent = tickets.length;
    document.getElementById("pendingTickets").textContent =
        tickets.filter(t => t.status === "Pending").length;

    document.getElementById("progressTickets").textContent =
        tickets.filter(t => t.status === "In Progress").length;

    document.getElementById("resolvedTickets").textContent =
        tickets.filter(t => t.status === "Resolved").length;

    document.getElementById("emptyMessage").style.display =
        filtered.length === 0 ? "block" : "none";

    filtered.forEach(ticket => {
        const row = document.createElement("tr");

        const statusClass = ticket.status.toLowerCase().replace(" ", "-");
        const priorityClass = ticket.priority.toLowerCase();

        const titleCell = document.createElement("td");
        titleCell.textContent = ticket.title;

        const categoryCell = document.createElement("td");
        categoryCell.textContent = ticket.category;

        const priorityCell = document.createElement("td");
        const priorityBadge = document.createElement("span");
        priorityBadge.className = `priority ${priorityClass}`;
        priorityBadge.textContent = ticket.priority;
        priorityCell.appendChild(priorityBadge);

        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");
        statusBadge.className = `status ${statusClass}`;
        statusBadge.textContent = ticket.status;
        statusCell.appendChild(statusBadge);

        const actionsCell = document.createElement("td");

        const select = document.createElement("select");
        select.className = "action-select";

        ["Pending", "In Progress", "Resolved"].forEach(status => {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            option.selected = ticket.status === status;
            select.appendChild(option);
        });

        select.addEventListener("change", () => {
            updateStatus(ticket.id, select.value);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.style.cssText =
            "margin-left:8px;padding:8px;background:#382027;color:#f87171;border:0;border-radius:6px;cursor:pointer;";

        deleteButton.addEventListener("click", () => {
            deleteTicket(ticket.id);
        });

        actionsCell.append(select, deleteButton);

        row.append(
            titleCell,
            categoryCell,
            priorityCell,
            statusCell,
            actionsCell
        );

        ticketList.appendChild(row);
    });
}

searchInput.addEventListener("input", renderTickets);
statusFilter.addEventListener("change", renderTickets);

renderTickets();
