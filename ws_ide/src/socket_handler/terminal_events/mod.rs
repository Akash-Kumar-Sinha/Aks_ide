pub mod close_terminal;
pub mod terminal_input;
pub mod terminal_resize;

pub use close_terminal::handle_close_terminal;
pub use terminal_input::handle_terminal_input;
pub use terminal_resize::handle_terminal_resize;
